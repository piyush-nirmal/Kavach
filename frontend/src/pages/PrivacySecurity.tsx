import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Lock, Eye, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function PrivacySecurity() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [settings, setSettings] = useState({
        twoFactor: false,
        publicProfile: false,
        dataSharing: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        toast({
            title: 'Security Updated',
            description: 'Your privacy preferences have been saved.',
        });
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-10">
            <div className="relative z-10 px-4 pt-6 pb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground mb-4"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-display font-bold text-foreground">
                    Privacy & Security
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Control your data and account security
                </p>
            </div>

            <div className="relative z-10 px-4 mt-6 space-y-6">
                <Card className="p-0 overflow-hidden divide-y divide-border">
                    <div className="p-4 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-emerald-600" />
                            Account Security
                        </h3>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label htmlFor="two-factor" className="text-base font-medium">Two-Factor Auth</Label>
                            <p className="text-sm text-muted-foreground">Require an extra step to log in</p>
                        </div>
                        <Switch
                            id="two-factor"
                            checked={settings.twoFactor}
                            onCheckedChange={() => handleToggle('twoFactor')}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>

                    <div className="p-4">
                        <Button variant="outline" className="w-full justify-start text-slate-700 bg-white" onClick={() => toast({ title: 'Sent Reset Link', description: 'Instructions sent to your email.' })}>
                            <KeyRound className="h-4 w-4 mr-2 text-slate-500" />
                            Change Password
                        </Button>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden divide-y divide-border">
                    <div className="p-4 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-emerald-600" />
                            Privacy Controls
                        </h3>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label htmlFor="public-profile" className="text-base font-medium">Public Profile</Label>
                            <p className="text-sm text-muted-foreground">Allow providers to find your profile easily</p>
                        </div>
                        <Switch
                            id="public-profile"
                            checked={settings.publicProfile}
                            onCheckedChange={() => handleToggle('publicProfile')}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5 pr-4">
                            <Label htmlFor="data-sharing" className="text-base font-medium">Analytics & Data Collection</Label>
                            <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                        </div>
                        <Switch
                            id="data-sharing"
                            checked={settings.dataSharing}
                            onCheckedChange={() => handleToggle('dataSharing')}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
