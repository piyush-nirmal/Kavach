import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Search,
    Shield,
    MoreVertical,
    UserCog,
    Loader2,
    Baby
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Ideally this check should be more robust
        // For now relying on client side check + visual suppression
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: "Failed to fetch users. You might not have permission.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'users', userId));
            setUsers(users.filter(u => u.id !== userId));
            toast({
                title: "User Deleted",
                description: "User has been removed from the system.",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: "Failed to delete user.",
                variant: "destructive"
            });
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    const parentsCount = users.filter(u => u.role === 'parent').length;
    const providersCount = users.filter(u => u.role === 'provider').length;
    const adminCount = users.filter(u => u.role === 'super_admin').length;

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="gradient-hero px-6 pt-8 pb-16">
                <h1 className="text-2xl font-display font-bold text-primary-foreground">
                    Super Admin Portal
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                    Manage users and system settings
                </p>
            </div>

            <div className="px-6 -mt-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <Card className="p-3 flex flex-col items-center justify-center text-center">
                        <Users className="h-6 w-6 text-primary mb-1" />
                        <span className="text-xl font-bold">{parentsCount}</span>
                        <span className="text-[10px] text-muted-foreground">Parents</span>
                    </Card>
                    <Card className="p-3 flex flex-col items-center justify-center text-center">
                        <UserCog className="h-6 w-6 text-secondary mb-1" />
                        <span className="text-xl font-bold">{providersCount}</span>
                        <span className="text-[10px] text-muted-foreground">Providers</span>
                    </Card>
                    <Card className="p-3 flex flex-col items-center justify-center text-center">
                        <Shield className="h-6 w-6 text-destructive mb-1" />
                        <span className="text-xl font-bold">{adminCount}</span>
                        <span className="text-[10px] text-muted-foreground">Admins</span>
                    </Card>
                </div>

                {/* User List */}
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg">All Users</h2>
                        <Badge variant="outline">{filteredUsers.length}</Badge>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredUsers.map((userItem) => (
                            <div key={userItem.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="font-bold text-primary">{userItem.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{userItem.name || 'Unnamed User'}</h3>
                                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{userItem.email}</p>
                                        <div className="flex gap-2">
                                            <Badge variant={userItem.role === 'provider' ? 'secondary' : userItem.role === 'super_admin' ? 'destructive' : 'outline'} className="mt-1 text-[10px] h-5">
                                                {userItem.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userItem.id)}>
                                            Copy User ID
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => deleteUser(userItem.id)}>
                                            Delete User
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No users found matching your search.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
