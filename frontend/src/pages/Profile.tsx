import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Baby,
  Phone,
  Mail,
  LogOut,
  ChevronRight,
  Edit,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  Plus,
  MapPin,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Child } from '@/types';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'children'), where('parentId', '==', user.id));
        const querySnapshot = await getDocs(q);
        const childrenData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
        setChildren(childrenData);
      } catch (error) {
        console.error("Error fetching children:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const { toast } = useToast();

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        name: editName,
        phone: editPhone,
        address: editAddress
      }, { merge: true });

      toast({
        title: "Profile Updated",
        description: "Your details have been saved. refreshing page...",
      });
      setIsEditOpen(false);
      // Force a reload to update context for now, simple solution
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error?.message || "Please check your network and Firebase Permissions.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { icon: Bell, label: 'Notification Settings', onClick: () => navigate('/profile/notification-settings') },
    { icon: Shield, label: 'Privacy & Security', onClick: () => navigate('/profile/privacy-security') },
    { icon: FileText, label: 'Terms of Service', onClick: () => navigate('/profile/terms-of-service') },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => navigate('/profile/help-support') },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-foreground">
              {user?.name}
            </h2>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role === 'parent' ? 'Parent / Guardian' : user?.role === 'super_admin' ? 'Super Admin' : 'Healthcare Provider'}
            </p>
          </div>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Edit className="h-5 w-5 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ''} disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Enter your address" />
                </div>
                <Button onClick={handleSaveProfile} className="w-full gradient-primary text-primary-foreground" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user?.phone || 'No phone number'}</span>
          </div>
          {user?.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user.address}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Children Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-foreground">My Children</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/register-child')}>
            <Plus className="h-4 w-4 mr-1" />
            Add Child
          </Button>
        </div>

        {children.length > 0 ? (
          children.map((child) => {
            const birthDate = new Date(child.dateOfBirth);
            const today = new Date();
            const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

            return (
              <Card key={child.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Baby className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{child.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ageInMonths} months old • {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/register-child?childId=${child.id}`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })
        ) : (
          <Card className="p-6 text-center border-dashed">
            <p className="text-muted-foreground text-sm mb-3">No children registered yet</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/register-child')}>
              Register a Child
            </Button>
          </Card>
        )}
      </div>

      {/* Menu Items */}
      <Card className="divide-y divide-border overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-4 p-4 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer touch-manipulation"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-slate-600" />
            </div>
            <span className="flex-1 text-left text-slate-800 font-medium">{item.label}</span>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </button>
        ))}
      </Card>

      {/* Logout Button */}
      <Button
        variant="outline"
        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground">
        Kavach v1.0.0
      </p>
    </div>
  );
}
