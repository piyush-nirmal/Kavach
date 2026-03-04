import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Phone, Baby, ChevronRight, CheckCircle2, AlertCircle, Calendar, Syringe, Megaphone, Send, Clock, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Child, User as UserType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function ProviderDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<{ parent: UserType; children: Child[] } | null>(null);
    const [error, setError] = useState('');
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('');

    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!user) return;
            try {
                // Fetch upcoming appointments
                const currentObj = new Date();
                const todayStr = currentObj.toISOString().split('T')[0];
                const apptQuery = query(collection(db, 'appointments'), where('date', '>=', todayStr));
                const apptSnap = await getDocs(apptQuery);

                let fetchedAppts = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

                // Filter by provider name loosely
                if (user.name) {
                    const providerBaseName = user.name.toLowerCase().replace('dr.', '').replace('dr', '').trim();
                    fetchedAppts = fetchedAppts.filter(appt =>
                        appt.doctorName?.toLowerCase().includes(providerBaseName) ||
                        user.name?.toLowerCase().includes(appt.doctorName?.toLowerCase())
                    );
                }

                // Fetch referenced children
                const childSnap = await getDocs(collection(db, 'children'));
                const childrenMap: Record<string, Child> = {};
                childSnap.docs.forEach(doc => {
                    childrenMap[doc.id] = { id: doc.id, ...doc.data() } as Child;
                });

                // Combine
                const schedule = fetchedAppts.map(appt => ({
                    ...appt,
                    childName: childrenMap[appt.childId]?.name || 'Unknown Patient'
                })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                setUpcomingAppointments(schedule);
            } catch (error) {
                console.error("Error fetching schedule", error);
            } finally {
                setIsLoadingSchedule(false);
            }
        };
        fetchSchedule();
    }, [user]);

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !broadcastMessage.trim()) return;

        try {
            // Write a notification aimed at all parents (or global).
            // For simplicity, we can create a broadcast message that the Notifications page queries.
            await addDoc(collection(db, 'broadcasts'), {
                providerId: user.id,
                providerName: user.name,
                message: broadcastMessage,
                date: serverTimestamp(),
            });

            toast({
                title: "Broadcast Sent",
                description: "Your alert has been sent to all registered patients.",
            });
            setIsBroadcastOpen(false);
            setBroadcastMessage('');
        } catch (error) {
            console.error("Error sending broadcast:", error);
            toast({
                title: "Error",
                description: "Failed to send broadcast.",
                variant: "destructive"
            });
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanQuery = searchQuery.trim();
        if (!cleanQuery) return;

        setIsSearching(true);
        setError('');
        setSearchResults(null);

        try {
            // 1. Determine search type
            const usersRef = collection(db, 'users');
            let parentDoc;

            if (cleanQuery.includes('@')) {
                // To bypass Firebase's strict case-sensitivity on strings, we fetch and filter locally.
                const allUsersSnap = await getDocs(usersRef);
                const matchedUser = allUsersSnap.docs.find(
                    doc => doc.data().email?.toLowerCase() === cleanQuery.toLowerCase()
                );

                if (!matchedUser) {
                    setError('No parent found. Please check the email.');
                    setIsSearching(false);
                    return;
                }
                parentDoc = matchedUser;
            } else {
                // Search by Phone
                const stripped = cleanQuery.replace(/\D/g, '');
                const variations = [
                    cleanQuery,
                    stripped,
                    `+${stripped}`,
                    `+91${stripped}`,
                    `${stripped.slice(-10)}`
                ];
                const uniqueVariations = Array.from(new Set(variations)).filter(v => v.length > 5);

                if (uniqueVariations.length === 0) {
                    setError('Please enter a valid phone number or email.');
                    setIsSearching(false);
                    return;
                }

                const q = query(usersRef, where('phone', 'in', uniqueVariations.slice(0, 10)));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError('No parent found. Please check the phone exactly matching their registration.');
                    setIsSearching(false);
                    return;
                }
                parentDoc = querySnapshot.docs[0];
            }

            // At this point we have the parentDoc
            const parentData = { id: parentDoc.id, ...(parentDoc.data() as UserType) };

            // 2. Fetch Children for this Parent
            const childrenRef = collection(db, 'children');
            const childrenQ = query(childrenRef, where('parentId', '==', parentData.id));
            const childrenSnapshot = await getDocs(childrenQ);

            const childrenData = childrenSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Child[];

            setSearchResults({
                parent: parentData,
                children: childrenData
            });

        } catch (err) {
            console.error("Search error:", err);
            setError('An error occurred while searching. Make sure the phone number matches exactly.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="gradient-hero px-6 pt-8 pb-16">
                <h1 className="text-2xl font-display font-bold text-primary-foreground">
                    Doctor Portal
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                    Find patient records by parent's phone
                </p>
            </div>

            <div className="px-6 -mt-8 space-y-6">
                {/* Analytics Dashboard */}
                <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <Card className="p-4 bg-white/90 backdrop-blur border-blue-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-sm text-slate-700">Today</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</p>
                        <p className="text-xs text-slate-500">Appointments scheduled</p>
                    </Card>

                    <Card className="p-4 bg-white/90 backdrop-blur border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Syringe className="h-4 w-4 text-emerald-600" />
                            </div>
                            <h3 className="font-semibold text-sm text-slate-700">This Week</h3>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
                        <p className="text-xs text-slate-500">Upcoming patients</p>
                    </Card>
                </div>

                {/* Broadcast Action */}
                <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
                    <DialogTrigger asChild>
                        <Card className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Megaphone className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Broadcast Alert</h3>
                                    <p className="text-sm text-slate-500">Send an update to all your patients</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Send Broadcast Alert</DialogTitle>
                            <DialogDescription>
                                This message will be sent as a push notification to all parents registered at your clinic.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSendBroadcast} className="space-y-4 pt-4">
                            <Textarea
                                placeholder="e.g., Flu shots are now available for children under 5!"
                                value={broadcastMessage}
                                onChange={(e) => setBroadcastMessage(e.target.value)}
                                rows={4}
                                required
                            />
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                <Send className="h-4 w-4 mr-2" />
                                Send Alert Now
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Upcoming Schedule */}
                <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">Today's Schedule & Upcoming</h2>
                    </div>

                    {isLoadingSchedule ? (
                        <Card className="p-8 text-center flex justify-center text-primary"><Loader2 className="animate-spin h-6 w-6" /></Card>
                    ) : upcomingAppointments.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground border-dashed">No upcoming appointments scheduled.</Card>
                    ) : (
                        <div className="grid gap-4">
                            {upcomingAppointments.map(appt => (
                                <Card key={appt.id} className="p-4 border-l-4 border-l-primary transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{appt.childName}</h3>
                                                {appt.date === new Date().toISOString().split('T')[0] && (
                                                    <Badge className="bg-primary/10 text-primary border-primary/20">Today</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">Reason: {appt.reason}</p>
                                            <div className="flex gap-4 text-sm font-medium text-slate-600">
                                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400" /> {new Date(appt.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> {appt.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => navigate(`/vaccinations?childId=${appt.childId}`)} className="bg-emerald-600 hover:bg-emerald-700">
                                                <Syringe className="h-4 w-4 mr-2" />
                                                Vaccines
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => navigate(`/doctor-visits?childId=${appt.childId}`)}>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search Card */}
                <Card className="p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Parent's Phone or Email</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter phone number or email address"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full gradient-primary text-primary-foreground"
                            disabled={isSearching}
                        >
                            {isSearching ? 'Searching...' : 'Search Records'}
                            {!isSearching && <Search className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-xl flex items-center gap-2 text-sm animate-fade-in">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {/* Results */}
                {searchResults && (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-lg">Search Results</h2>
                            <Badge variant="outline">{searchResults.children.length} Children Found</Badge>
                        </div>

                        {/* Parent Info */}
                        <Card className="p-4 bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{searchResults.parent.name}</h3>
                                    <p className="text-sm text-muted-foreground">{searchResults.parent.email}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Children List */}
                        <div className="grid gap-4">
                            {searchResults.children.map((child) => (
                                <Card key={child.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                            <Baby className="h-6 w-6 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{child.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Born: {new Date(child.dateOfBirth).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => navigate(`/vaccinations?childId=${child.id}`)}>
                                            View Vaccines
                                        </Button>
                                        <Button size="sm" onClick={() => navigate(`/doctor-visits?childId=${child.id}`)}>
                                            Clinical Notes
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {searchResults.children.length === 0 && (
                            <div className="text-center p-8 bg-muted/20 rounded-xl">
                                <p className="text-muted-foreground">No children registered for this parent.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
