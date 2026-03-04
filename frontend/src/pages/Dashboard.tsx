import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/ui/GlowCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { motion } from 'framer-motion';

import {
  Baby,
  Syringe,
  Calendar,
  Bell,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  Shield,
  TrendingUp,
  Heart
} from 'lucide-react';
import { vaccinationSchedule } from '@/data/mockData';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Child, VaccinationRecord } from '@/types';

interface Appointment {
  id: string;
  childId: string;
  doctorName: string;
  date: string;
  time: string;
  notes?: string;
}

interface Alert {
  id: string;
  isRead: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // State for real data
  const [children, setChildren] = useState<Child[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = useState<VaccinationRecord[]>([]);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect Provider
  if (user?.role === 'provider') {
    return <Navigate to="/provider-dashboard" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Fetch Children
        const childrenQ = query(collection(db, 'children'), where('parentId', '==', user.id));
        const childrenSnapshot = await getDocs(childrenQ);
        const childrenData = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Child[];
        setChildren(childrenData);

        const childIds = childrenData.map(c => c.id);
        const alerts: Alert[] = [];
        const appointmentsToday: Appointment[] = [];

        // 2. Fetch Data if children exist
        if (childIds.length > 0) {
          // A. Fetch Appointments for ALL children (for notifications)
          // Limit to 10 for 'in' query
          const apptQ = query(collection(db, 'appointments'), where('childId', 'in', childIds.slice(0, 10)));
          const apptSnap = await getDocs(apptQ);

          apptSnap.forEach(doc => {
            const data = doc.data() as Omit<Appointment, 'id'>;
            const todayStr = new Date().toISOString().split('T')[0];

            // Check for today's appointments
            if (data.date === todayStr) {
              appointmentsToday.push({ ...data, id: doc.id } as Appointment);
            }

            // Add to alerts if future or today
            const endOfDay = new Date(data.date + 'T23:59:59');
            if (endOfDay >= new Date()) {
              alerts.push({
                id: doc.id,
                isRead: false
              });
            }
          });

          // B. Fetch Vaccination Records for ALL children (for notifications)
          const allRecordsQ = query(collection(db, 'vaccination_records'), where('childId', 'in', childIds.slice(0, 10)));
          const allRecordsSnap = await getDocs(allRecordsQ);
          const allRecords = allRecordsSnap.docs.map(doc => ({ ...doc.data() })) as VaccinationRecord[];

          // Calculate Vaccine Alerts
          childrenData.forEach((child) => {
            const childRecords = allRecords.filter((r) => r.childId === child.id);
            const administered = new Set(childRecords.map((r) => r.vaccineName));
            const birthDate = new Date(child.dateOfBirth);
            const today = new Date();
            const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

            vaccinationSchedule.forEach(vaccine => {
              if (administered.has(vaccine.vaccineName)) return;
              const daysUntilDue = vaccine.ageInDays - ageInDays;
              // Overdue or due within 30 days
              if (daysUntilDue <= 30) {
                alerts.push({ id: `${child.id}-${vaccine.id}`, isRead: false });
              }
            });
          });

          // C. Set Vaccination Records for the FIRST child (for Dashboard UI stats)
          if (childrenData.length > 0) {
            const firstChildId = childrenData[0].id;
            const childRecords = allRecords.filter((r) => r.childId === firstChildId);
            setVaccinationRecords(childRecords);
          }
        }

        setNotifications(alerts);

        // Notify for today's appointments
        if (appointmentsToday.length > 0) {
          appointmentsToday.forEach(appt => {
            toast({
              title: "Appointment Today!",
              description: `You have a visit with ${appt.doctorName} at ${appt.time}.`,
              duration: 5000,
            });
          });
        }

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Use the first child found, or null
  const child = children.length > 0 ? children[0] : null;

  // Calculate days until next vaccine based on REAL records
  const administeredNames = new Set(vaccinationRecords.map((v: VaccinationRecord) => v.vaccineName));
  const birthDate = child ? new Date(child.dateOfBirth) : new Date();
  const today = new Date();
  const ageInDays = child ? Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const nextVaccine = vaccinationSchedule.find(
    (v) => !administeredNames.has(v.vaccineName) && v.ageInDays >= ageInDays
  );

  const daysUntilNext = nextVaccine
    ? Math.max(0, nextVaccine.ageInDays - ageInDays)
    : null;

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Calculate child's age
  const ageMonths = Math.floor(ageInDays / 30);
  const ageDays = ageInDays % 30;

  // Calculate vaccination progress
  const totalVaccines = vaccinationSchedule.length;
  const completedVaccines = vaccinationRecords.length;
  const progressPercent = totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }


  return (
    <div className="px-4 py-6">
      {/* Hero Welcome Section */}
      <div className="hero-card animate-fade-in text-white relative mb-6 hover:shadow-lg transition-transform duration-300">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-yellow-300" />
              </div>
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm hover:bg-white/30">
                Health Overview
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Shield className="h-4 w-4" />
              <span>Protected</span>
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold mb-2">
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/80 max-w-sm">
            {child
              ? `${child.name}'s health journey is on track. Keep up the great work!`
              : 'Get started by registering your child to track their vaccinations.'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Child Card or Empty State */}
          {child ? (
            <GlowCard
              glowColor="primary"
              className="animate-slide-up hover:shadow-lg shadow-slate-200"
              onClick={() => navigate('/profile')}
            >
              <div className="p-5 flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Baby className="h-8 w-8 text-violet-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{child.name}</h3>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-0">
                      <Heart className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {ageMonths} months, {ageDays} days old
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-violet-50 shrink-0">
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Button>
              </div>
            </GlowCard>
          ) : (
            <EmptyState
              icon={<Baby />}
              title="No Child Registered"
              description="Your journey starts here. Add your child's profile to begin tracking their vaccinations and health records securely."
              actionLabel="Add Your First Child"
              actionIcon={<Plus className="h-5 w-5" />}
              navigateTo="/register-child"
            />
          )}

          {/* Next Vaccine Alert */}
          {child && nextVaccine && (
            <GlowCard
              glowColor="warning"
              className="animate-slide-up delay-100 hover:shadow-lg shadow-slate-200"
              onClick={() => navigate('/vaccinations')}
            >
              <div className="p-5 flex items-start gap-4 border-l-4 border-l-amber-500">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                  <Syringe className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Up Next</span>
                    {daysUntilNext !== null && daysUntilNext <= 7 && (
                      <Badge className="bg-amber-100 text-amber-700 border-0 animate-pulse">
                        Action Needed
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{nextVaccine.vaccineName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className={`text-sm font-medium ${daysUntilNext !== null && daysUntilNext <= 7 ? 'text-amber-600' : 'text-slate-600'}`}>
                      {daysUntilNext === 0 ? 'Due today!' : `Due in ${daysUntilNext} days`}
                    </span>
                  </div>
                </div>
              </div>
            </GlowCard>
          )}

          {/* Vaccination Schedule */}
          {child && (
            <div className="animate-slide-up delay-400">
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upcoming Schedule</h2>
                  <p className="text-sm text-slate-500">Your next vaccinations</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/vaccinations')}
                  className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 font-semibold"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {vaccinationSchedule
                  .filter(v => !administeredNames.has(v.vaccineName))
                  .slice(0, 3)
                  .map((vaccine, index) => {
                    const dueDays = vaccine.ageInDays - ageInDays;
                    const isPast = dueDays < 0;
                    const isUrgent = dueDays <= 7 && dueDays >= 0;

                    return (
                      <GlowCard
                        key={vaccine.id}
                        glowColor={isPast ? 'warning' : 'primary'}
                        className="animate-slide-up hover:shadow-lg shadow-slate-200"
                        hover={true}
                        onClick={() => navigate('/vaccinations')}
                      >
                        <div className="p-4 flex items-center gap-4 list-item-hover">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isPast
                            ? 'bg-gradient-to-br from-red-100 to-rose-100'
                            : isUrgent
                              ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                              : 'bg-gradient-to-br from-slate-100 to-gray-100'
                            }`}>
                            <Calendar className={`h-5 w-5 ${isPast
                              ? 'text-red-500'
                              : isUrgent
                                ? 'text-amber-500'
                                : 'text-slate-500'
                              }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm truncate">{vaccine.vaccineName}</h4>
                            <p className="text-xs text-slate-500 mt-1">Recommended age: {vaccine.recommendedAge}</p>
                          </div>
                          <Badge
                            variant={isPast ? 'destructive' : 'secondary'}
                            className={`shrink-0 ${isPast
                              ? 'bg-red-100 text-red-700 border-0'
                              : isUrgent
                                ? 'bg-amber-100 text-amber-700 border-0'
                                : 'bg-slate-100 text-slate-600 border-0'
                              }`}
                          >
                            {isPast ? 'Overdue' : dueDays === 0 ? 'Today' : `${dueDays} days`}
                          </Badge>
                        </div>
                      </GlowCard>
                    );
                  })}

                {vaccinationSchedule.filter(v => !administeredNames.has(v.vaccineName)).length === 0 && (
                  <Card className="p-8 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-emerald-900 mb-1">All Caught Up! 🎉</h3>
                    <p className="text-sm text-emerald-700">No upcoming vaccines scheduled</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div> {/* End of Main Column */}

        {/* Side Column (Span 1) */}
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          {/* Quick Stats Grid */}
          {child && (
            <div className="grid grid-cols-2 gap-4">
              {/* Vaccines Done */}
              <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                transition={{ duration: 0.2 }}
                className="stat-card cursor-pointer group animate-slide-up delay-200"
                onClick={() => navigate('/vaccinations')}
                style={{ '--stat-color': 'hsl(142 76% 36%)' } as React.CSSProperties}
              >
                <div className="stat-card::before bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-emerald-900">
                      <AnimatedCounter value={vaccinationRecords.length} />
                    </p>
                    <p className="text-xs font-semibold text-emerald-600/80 uppercase tracking-wide mt-1">Vaccines Done</p>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
              </motion.div>

              {/* Alerts */}
              <motion.div
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                transition={{ duration: 0.2 }}
                className="stat-card cursor-pointer group animate-slide-up delay-300"
                onClick={() => navigate('/notifications')}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg shadow-amber-500/20 relative group-hover:scale-110 transition-transform">
                    <Bell className="h-6 w-6 text-amber-600" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white pulse-dot">
                        {unreadNotifications}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-900">
                      <AnimatedCounter value={unreadNotifications} />
                    </p>
                    <p className="text-xs font-semibold text-amber-600/80 uppercase tracking-wide mt-1">Alerts</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Progress Ring Card */}
          {child && (
            <Card className="p-6 border border-slate-200 hover:border-primary/30 transition-colors shadow-sm animate-slide-up delay-300">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-slate-800 text-lg">Vaccination Completion</h3>
                <p className="text-xs text-slate-500 mt-1">Track your child's immunization progress</p>
              </div>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="75%"
                    outerRadius="100%"
                    barSize={16}
                    data={[{ name: 'Progress', value: progressPercent, fill: 'hsl(250 84% 54%)' }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      background={{ fill: 'hsl(250 84% 96%)' }}
                      dataKey="value"
                      cornerRadius={10}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-4xl font-display font-bold fill-violet-600"
                    >
                      <AnimatedCounter value={progressPercent} />%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center text-sm font-medium mt-4 pt-4 border-t border-slate-100">
                <span className="text-slate-500">Completed: <span className="text-slate-900">{completedVaccines}</span></span>
                <span className="text-slate-500">Total: <span className="text-slate-900">{totalVaccines}</span></span>
              </div>
            </Card>
          )}

        </div> {/* End of Side Column */}
      </div> {/* End of Bento Grid */}


    </div>
  );
}
