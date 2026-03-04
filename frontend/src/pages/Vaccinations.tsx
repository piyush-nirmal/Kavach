import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Syringe, CheckCircle2, Clock, Plus, Calendar, MapPin, User, Loader2, Baby } from 'lucide-react';
import { vaccinationSchedule } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Child, VaccinationRecord } from '@/types';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { motion } from 'framer-motion';

export default function Vaccinations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const childIdParam = searchParams.get('childId');

  const [children, setChildren] = useState<Child[]>([]);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState('');
  const [location, setLocation] = useState('');
  const [administeredBy, setAdministeredBy] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        let childrenData: Child[] = [];

        if (childIdParam) {
          // Fetch specific child
          const childDoc = await getDoc(doc(db, 'children', childIdParam));
          if (childDoc.exists()) {
            childrenData = [{ id: childDoc.id, ...childDoc.data() } as Child];
          }
        } else {
          // Fetch Children for parent
          const childrenQ = query(collection(db, 'children'), where('parentId', '==', user.id));
          const childrenSnapshot = await getDocs(childrenQ);
          childrenData = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
        }

        setChildren(childrenData);

        if (childrenData.length > 0) {
          // Fetch records for the first child (for now)
          const recordsQ = query(collection(db, 'vaccination_records'), where('childId', '==', childrenData[0].id));
          const recordsSnapshot = await getDocs(recordsQ);
          const recordsData = recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VaccinationRecord));
          setRecords(recordsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, childIdParam]);

  const child = children[0]; // Simplification for now

  const administeredNames = new Set(records.map(v => v.vaccineName));

  const birthDate = child ? new Date(child.dateOfBirth) : new Date();
  const today = new Date();
  const ageInDays = child ? Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const upcomingVaccines = vaccinationSchedule.filter(v => !administeredNames.has(v.vaccineName));

  const handleAddVaccination = async () => {
    if (!child) return;
    setIsSaving(true);

    try {
      const newRecord = {
        childId: child.id,
        vaccineName,
        dateAdministered: vaccineDate,
        location,
        administeredBy,
        batchNumber
      };

      const docRef = await addDoc(collection(db, 'vaccination_records'), newRecord);

      const savedRecord = { id: docRef.id, ...newRecord } as VaccinationRecord;
      setRecords([...records, savedRecord]);

      toast({
        title: 'Vaccination Added',
        description: `${vaccineName} has been recorded.`,
      });

      setIsDialogOpen(false);
      setVaccineName('');
      setVaccineDate('');
      setLocation('');
      setAdministeredBy('');
      setBatchNumber('');
    } catch (error) {
      console.error("Error saving vaccination:", error);
      toast({
        title: 'Error',
        description: 'Failed to save record.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!child && !loading) {
    return (
      <div className="p-4 md:p-8 max-w-lg mx-auto mt-10">
        <EmptyState
          icon={<Baby />}
          title="No Child Registered"
          description="Your journey starts here. Add your child's profile to begin tracking their vaccinations and health records securely."
          actionLabel="Add Your First Child"
          actionIcon={<Plus className="h-4 w-4" />}
          navigateTo="/register-child"
        />
      </div>
    );
  }

  const openAddDialog = (prefillName?: string) => {
    setVaccineName(prefillName || '');
    setVaccineDate(new Date().toISOString().split('T')[0]);
    setIsDialogOpen(true);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Vaccinations</h1>
          <p className="text-muted-foreground text-sm">Track {child?.name}'s immunization</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground" size="sm" onClick={() => openAddDialog()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Vaccination Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="vaccineName">Vaccine Name</Label>
                <Input
                  id="vaccineName"
                  placeholder="e.g., DPT-1"
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccineDate">Date Administered</Label>
                <Input
                  id="vaccineDate"
                  type="date"
                  value={vaccineDate}
                  onChange={(e) => setVaccineDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Hospital/Clinic name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="administeredBy">Administered By</Label>
                <Input
                  id="administeredBy"
                  placeholder="Doctor's name"
                  value={administeredBy}
                  onChange={(e) => setAdministeredBy(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch/Lot Number</Label>
                <Input
                  id="batchNumber"
                  placeholder="Manufacturer batch number"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddVaccination}
                className="w-full gradient-primary text-primary-foreground"
                disabled={isSaving || !vaccineName || !vaccineDate}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Record'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-success/5 border-success/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold text-success">{records.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-warning/5 border-warning/20">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-warning">{upcomingVaccines.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcomingVaccines.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground">All vaccinations complete!</p>
            </Card>
          ) : (
            upcomingVaccines.map((vaccine) => {
              const dueDays = vaccine.ageInDays - ageInDays;
              const isOverdue = dueDays < 0;
              const isDueSoon = dueDays >= 0 && dueDays <= 7;

              return (
                <Card key={vaccine.id} className="p-4 hover:-translate-y-1 hover:shadow-lg shadow-slate-200 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-destructive/10' : isDueSoon ? 'bg-warning/10' : 'bg-muted'
                      }`}>
                      <Syringe className={`h-5 w-5 ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground">{vaccine.vaccineName}</h4>
                          <p className="text-sm text-muted-foreground">{vaccine.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Recommended: {vaccine.recommendedAge}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant={isOverdue ? 'destructive' : isDueSoon ? 'secondary' : 'outline'}
                            className={`whitespace-nowrap ${isDueSoon && !isOverdue ? 'bg-warning/10 text-warning border-warning/20' : ''}`}
                          >
                            {isOverdue ? `${Math.abs(dueDays)}d overdue` : dueDays === 0 ? 'Today' : `${dueDays}d`}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-primary/20 hover:bg-primary/5 text-primary"
                            onClick={() => openAddDialog(vaccine.vaccineName)}
                          >
                            Mark as Done
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-3">
          {records.length === 0 ? (
            <Card className="p-8 text-center">
              <Syringe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No vaccination records yet</p>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id} className="p-4 hover:-translate-y-1 hover:shadow-lg shadow-slate-200 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{record.vaccineName}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.dateAdministered).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.location}
                      </span>
                      {record.administeredBy && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {record.administeredBy}
                        </span>
                      )}
                      {record.batchNumber && (
                        <Badge variant="outline" className="text-[10px] h-5 py-0 px-1 font-mono">
                          Lot: {record.batchNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
