import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Syringe, Stethoscope, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { vaccinationSchedule } from '@/data/mockData';
import { Child, VaccinationRecord } from '@/types';

interface NotificationItem {
  id: string;
  type: 'vaccine' | 'appointment' | 'broadcast';
  title: string;
  message: string;
  date: Date;
  childName: string;
  isOverdue?: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        // 1. Fetch Children
        const childrenQ = query(collection(db, 'children'), where('parentId', '==', user.id));
        const childrenSnap = await getDocs(childrenQ);
        const children = childrenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));

        if (children.length === 0) {
          setLoading(false);
          return;
        }

        const childIds = children.map(c => c.id);
        const alerts: NotificationItem[] = [];

        // 1.5 Fetch General Broadcasts (Alerts from doctors)
        const broadcastsQ = query(collection(db, 'broadcasts'));
        const broadcastsSnap = await getDocs(broadcastsQ);
        broadcastsSnap.forEach(doc => {
          const data = doc.data();
          alerts.push({
            id: doc.id,
            type: 'broadcast',
            title: `Alert from ${data.providerName}`,
            message: data.message,
            date: data.date ? data.date.toDate() : new Date(), // Handle Firestore timestamp
            childName: 'All Patients'
          });
        });

        // 2. Fetch Appointments
        // Firestore 'in' query supports max 10 items. If more children, might need multiple queries. 
        // For now assuming < 10 children.
        if (childIds.length > 0) {
          const apptQ = query(collection(db, 'appointments'), where('childId', 'in', childIds.slice(0, 10)));
          const apptSnap = await getDocs(apptQ);

          apptSnap.forEach(doc => {
            const data = doc.data();
            const apptDate = new Date(data.date); // string YYYY-MM-DD
            const child = children.find(c => c.id === data.childId);

            // Only show future or recent appointments (e.g. last 24h?)
            // Actually, let's show all future ones.
            if (new Date(data.date + 'T23:59:59') >= new Date()) {
              alerts.push({
                id: doc.id,
                type: 'appointment',
                title: 'Upcoming Appointment',
                message: `Appointment with ${data.doctorName} for ${child?.name}`,
                date: apptDate,
                childName: child?.name || 'Child'
              });
            }
          });

          // 3. Fetch Vaccination Records
          const recordsQ = query(collection(db, 'vaccination_records'), where('childId', 'in', childIds.slice(0, 10)));
          const recordsSnap = await getDocs(recordsQ);
          const records = recordsSnap.docs.map(doc => ({ ...doc.data() } as VaccinationRecord));

          // 4. Calculate Vaccine Alerts
          children.forEach(child => {
            const childRecords = records.filter(r => r.childId === child.id);
            const administered = new Set(childRecords.map(r => r.vaccineName));
            const birthDate = new Date(child.dateOfBirth);
            const today = new Date();
            const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

            vaccinationSchedule.forEach(vaccine => {
              if (administered.has(vaccine.vaccineName)) return;

              const daysUntilDue = vaccine.ageInDays - ageInDays;

              // Logic: Show if Overdue OR Due within next 30 days
              if (daysUntilDue <= 30) {
                // Estimate due date
                const dueDate = new Date(birthDate.getTime() + (vaccine.ageInDays * 24 * 60 * 60 * 1000));

                alerts.push({
                  id: `${child.id}-${vaccine.id}`, // Synthetic ID
                  type: 'vaccine',
                  title: daysUntilDue < 0 ? 'Vaccine Overdue' : 'Vaccine Due Soon',
                  message: `${vaccine.vaccineName} is ${daysUntilDue < 0 ? 'overdue' : 'upcoming'} for ${child.name}`,
                  date: dueDate,
                  childName: child.name,
                  isOverdue: daysUntilDue < 0
                });
              }
            });
          });
        }

        // Sort by date (nearest first)
        alerts.sort((a, b) => a.date.getTime() - b.date.getTime());

        setNotifications(alerts);

      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            {notifications.length > 0 ? `You have ${notifications.length} active alerts` : 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No new notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all set! Check back later.
            </p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-colors ${notification.isOverdue ? 'border-red-200 bg-red-50' : 'bg-card'}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${notification.type === 'vaccine'
                    ? 'bg-blue-100 text-blue-600'
                    : notification.type === 'broadcast'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-indigo-100 text-indigo-600'
                    }`}
                >
                  {notification.type === 'vaccine' ? (
                    <Syringe className="h-5 w-5" />
                  ) : notification.type === 'broadcast' ? (
                    <Bell className="h-5 w-5" />
                  ) : (
                    <Stethoscope className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-foreground truncate">
                      {notification.title}
                    </h4>
                    <Badge variant={notification.isOverdue ? 'destructive' : notification.type === 'broadcast' ? 'default' : 'secondary'} className="text-xs">
                      {notification.type === 'vaccine' ? 'Vaccine' : notification.type === 'broadcast' ? 'Alert' : 'Appointment'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Due: {notification.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
