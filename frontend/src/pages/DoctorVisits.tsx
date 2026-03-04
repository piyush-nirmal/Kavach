import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Stethoscope, Calendar, FileText, Upload, Plus, Baby,
    History as HistoryIcon, X, Loader2, Clock, MapPin, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DoctorVisit, Child } from '@/types';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { motion } from 'framer-motion';
import { User as UserType } from '@/types';

interface Appointment {
    id: string;
    childId: string;
    doctorName: string;
    date: string;
    time: string;
    reason: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export default function DoctorVisits() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Data State
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string>('');
    const [visits, setVisits] = useState<DoctorVisit[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [providers, setProviders] = useState<UserType[]>([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
    const [isApptFormOpen, setIsApptFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Visit Form State
    const [doctorName, setDoctorName] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [prescription, setPrescription] = useState<File | null>(null);

    // Appointment Form State
    const [apptDoctor, setApptDoctor] = useState('');
    const [apptDate, setApptDate] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [apptReason, setApptReason] = useState('');

    // 1. Fetch Children on Mount
    useEffect(() => {
        const fetchChildren = async () => {
            if (!user) return;
            const paramId = searchParams.get('childId');

            try {
                if (paramId) {
                    // Fetch specific child if param exists (e.g. for Provider viewing a patient)
                    const childDoc = await getDoc(doc(db, 'children', paramId));
                    if (childDoc.exists()) {
                        const childData = { id: childDoc.id, ...childDoc.data() } as Child;
                        setChildren([childData]);
                        setSelectedChildId(childData.id);
                    }
                } else {
                    // Fetch User's own children
                    const q = query(collection(db, 'children'), where('parentId', '==', user.id));
                    const snapshot = await getDocs(q);
                    const fetchedChildren = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
                    setChildren(fetchedChildren);

                    if (fetchedChildren.length > 0) {
                        setSelectedChildId(fetchedChildren[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching children:", error);
                toast({ title: "Error", description: "Failed to load children profiles.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };

        const fetchProviders = async () => {
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'provider'));
                const snapshot = await getDocs(q);
                const fetchedProviders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
                setProviders(fetchedProviders);
            } catch (error) {
                console.error("Error fetching providers:", error);
            }
        };

        fetchChildren();
        fetchProviders();
    }, [user, searchParams, toast]);

    // 2. Fetch Visits & Appointments when Child Changes
    useEffect(() => {
        if (!selectedChildId) return;

        // Fetch Visits
        const visitsQ = query(
            collection(db, 'doctorVisits'),
            where('childId', '==', selectedChildId)
            // orderBy('visitDate', 'desc') // Requires composite index, skipping for now
        );

        const unsubVisits = onSnapshot(visitsQ, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorVisit));
            // Client-side sort
            fetched.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
            setVisits(fetched);
        });

        // Fetch Appointments
        const apptQ = query(
            collection(db, 'appointments'),
            where('childId', '==', selectedChildId)
        );

        const unsubAppts = onSnapshot(apptQ, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
            // Client-side sort
            fetched.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setAppointments(fetched);
        });

        return () => {
            unsubVisits();
            unsubAppts();
        };
    }, [selectedChildId]);

    const handleSaveVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedChildId) return;
        setIsSubmitting(true);

        try {
            let prescriptionUrl = '';
            if (prescription) {
                const storageRef = ref(storage, `prescriptions/${user.id}/${Date.now()}_${prescription.name}`);
                const snapshot = await uploadBytes(storageRef, prescription);
                prescriptionUrl = await getDownloadURL(snapshot.ref);
            }

            const visitData = {
                userId: user.id,
                childId: selectedChildId,
                doctorName,
                visitDate,
                reason,
                notes,
                prescriptionImages: prescriptionUrl ? [prescriptionUrl] : [],
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'doctorVisits'), visitData);

            toast({ title: 'Visit Logged', description: 'Doctor visit saved successfully.' });
            setIsVisitFormOpen(false);
            // Reset form
            setDoctorName('');
            setVisitDate('');
            setReason('');
            setNotes('');
            setPrescription(null);
        } catch (error) {
            console.error("Error saving visit:", error);
            toast({ title: 'Error', description: 'Failed to save visit.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScheduleAppt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedChildId) return;
        setIsSubmitting(true);

        try {
            const apptData = {
                userId: user.id,
                childId: selectedChildId,
                doctorName: apptDoctor,
                date: apptDate,
                time: apptTime,
                reason: apptReason,
                status: 'scheduled',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'appointments'), apptData); // New collection

            toast({ title: 'Appointment Scheduled', description: 'Reminder set successfully.' });
            setIsApptFormOpen(false);
            setApptDoctor('');
            setApptDate('');
            setApptTime('');
            setApptReason('');
        } catch (error) {
            console.error("Error scheduling appointment:", error);
            toast({ title: 'Error', description: 'Failed to schedule appointment.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="gradient-hero px-6 pt-6 pb-16">
                <Button variant="ghost" size="icon" className="text-primary-foreground mb-4" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-primary-foreground flex items-center gap-2">
                            <Stethoscope className="h-6 w-6" />
                            Care & Visits
                        </h1>
                        <p className="text-primary-foreground/80 text-sm">Manage checkups and history</p>
                    </div>
                </div>

                {/* Child Selector */}
                {children.length > 1 && (
                    <div className="mt-6">
                        <Label className="text-primary-foreground/80 mb-2 block">Select Child</Label>
                        <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                            <SelectTrigger className="w-full bg-white/10 text-white border-white/20">
                                <SelectValue placeholder="Select child" />
                            </SelectTrigger>
                            <SelectContent>
                                {children.map(child => (
                                    <SelectItem key={child.id} value={child.id}>{child.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="px-6 -mt-8 space-y-6">
                {!selectedChildId && children.length === 0 ? (
                    <div className="p-4 md:p-8 max-w-lg mx-auto mt-10">
                        <EmptyState
                            icon={<Baby />}
                            title="No Child Registered"
                            description="Your journey starts here. Add your child's profile to begin managing their checkups and history."
                            actionLabel="Register Child"
                            actionIcon={<Plus className="h-4 w-4" />}
                            navigateTo="/register-child"
                        />
                    </div>
                ) : (
                    <Tabs defaultValue="appointments" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 mb-6">
                            <TabsTrigger value="appointments">Appointments</TabsTrigger>
                            <TabsTrigger value="visits">Past Visits</TabsTrigger>
                        </TabsList>

                        {/* Appointments Tab */}
                        <TabsContent value="appointments" className="space-y-4">
                            {!isApptFormOpen ? (
                                <Card className="p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-lg transition-all border-dashed" onClick={() => setIsApptFormOpen(true)}>
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg text-primary">Schedule Checkup</h3>
                                        <p className="text-sm text-muted-foreground">Set a reminder for an upcoming doctor visit</p>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold">New Appointment</h2>
                                        <Button variant="ghost" size="icon" onClick={() => setIsApptFormOpen(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <form onSubmit={handleScheduleAppt} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Doctor/Clinic Name</Label>
                                            <Select value={apptDoctor} onValueChange={setApptDoctor} required>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a Doctor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {providers.length === 0 ? (
                                                        <SelectItem value="none" disabled>No doctors found</SelectItem>
                                                    ) : (
                                                        providers.map(provider => (
                                                            <SelectItem key={provider.id} value={provider.name}>
                                                                {provider.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Date</Label>
                                                <Input type="date" value={apptDate} onChange={e => setApptDate(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Time</Label>
                                                <Input type="time" value={apptTime} onChange={e => setApptTime(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reason</Label>
                                            <Input value={apptReason} onChange={e => setApptReason(e.target.value)} placeholder="routine checkup, vaccination..." required />
                                        </div>
                                        <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Schedule Appointment'}
                                        </Button>
                                    </form>
                                </Card>
                            )}

                            <div className="space-y-3">
                                {appointments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No upcoming appointments.</div>
                                ) : (
                                    appointments.map(appt => (
                                        <Card key={appt.id} className="p-4 border-l-4 border-l-blue-500">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-base">{appt.doctorName}</h4>
                                                    <p className="text-sm text-muted-foreground">{appt.reason}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-blue-600">
                                                        <Clock className="h-4 w-4" />
                                                        {new Date(appt.date).toLocaleDateString()} at {appt.time}
                                                    </div>
                                                </div>
                                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        {/* Past Visits Tab */}
                        <TabsContent value="visits" className="space-y-4">
                            {!isVisitFormOpen ? (
                                <Card className="p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-lg transition-all border-dashed" onClick={() => setIsVisitFormOpen(true)}>
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <HistoryIcon className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-lg text-emerald-700">Log Past Visit</h3>
                                        <p className="text-sm text-muted-foreground">Keep records of diagnosis, notes, and prescriptions</p>
                                    </div>
                                </Card>
                            ) : (
                                <Card className="p-6 animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-bold">Visit Details</h2>
                                        <Button variant="ghost" size="icon" onClick={() => setIsVisitFormOpen(false)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <form onSubmit={handleSaveVisit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Doctor Name</Label>
                                            <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Visit Date</Label>
                                            <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Reason</Label>
                                            <Input value={reason} onChange={e => setReason(e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Notes</Label>
                                            <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prescription Image</Label>
                                            <Input type="file" accept="image/*" onChange={e => e.target.files && setPrescription(e.target.files[0])} />
                                        </div>
                                        <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Save Record'}
                                        </Button>
                                    </form>
                                </Card>
                            )}

                            <div className="space-y-3">
                                {visits.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No visits logged yet.</div>
                                ) : (
                                    visits.map(visit => (
                                        <Card key={visit.id} className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Stethoscope className="h-4 w-4 text-primary" />
                                                        <h3 className="font-semibold">{visit.doctorName}</h3>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{visit.reason}</p>
                                                </div>
                                                <div className="text-xs bg-muted px-2 py-1 rounded-full text-foreground/80 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {visit.visitDate}
                                                </div>
                                            </div>
                                            {visit.notes && <p className="text-sm mt-2 bg-muted/30 p-2 rounded">{visit.notes}</p>}
                                            {visit.prescriptionImages && visit.prescriptionImages.length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Prescription</p>
                                                    <div className="h-16 w-16 rounded-md bg-muted border flex items-center justify-center overflow-hidden">
                                                        <img src={visit.prescriptionImages[0]} alt="Prescription" className="h-full w-full object-cover" />
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}
