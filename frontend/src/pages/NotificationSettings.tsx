import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell, BellRing, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettings() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [settings, setSettings] = useState({
        pushNotifications: true,
        emailNotifications: true,
        smsAlerts: false,
        vaccinationReminders: true,
        appointmentUpdates: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        toast({
            title: 'Settings Updated',
            description: 'Your notification preferences have been saved.',
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
                    Notifications
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage how and when you receive alerts
                </p>
            </div>

            <div className="relative z-10 px-4 mt-6 space-y-6">
                <Card className="p-0 overflow-hidden divide-y divide-border">
                    <div className="p-4 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Bell className="h-4 w-4 text-violet-600" />
                            Delivery Methods
                        </h3>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="push-notifs" className="text-base font-medium">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                        </div>
                        <Switch
                            id="push-notifs"
                            checked={settings.pushNotifications}
                            onCheckedChange={() => handleToggle('pushNotifications')}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-notifs" className="text-base font-medium">Email Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch
                            id="email-notifs"
                            checked={settings.emailNotifications}
                            onCheckedChange={() => handleToggle('emailNotifications')}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="sms-notifs" className="text-base font-medium">SMS Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive text messages (charges may apply)</p>
                        </div>
                        <Switch
                            id="sms-notifs"
                            checked={settings.smsAlerts}
                            onCheckedChange={() => handleToggle('smsAlerts')}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden divide-y divide-border">
                    <div className="p-4 bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <BellRing className="h-4 w-4 text-violet-600" />
                            Alert Types
                        </h3>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="vax-reminders" className="text-base font-medium">Vaccine Reminders</Label>
                            <p className="text-sm text-muted-foreground">Alerts for upcoming due dates</p>
                        </div>
                        <Switch
                            id="vax-reminders"
                            checked={settings.vaccinationReminders}
                            onCheckedChange={() => handleToggle('vaccinationReminders')}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>

                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="appt-updates" className="text-base font-medium">Appointment Updates</Label>
                            <p className="text-sm text-muted-foreground">Changes to scheduled visits</p>
                        </div>
                        <Switch
                            id="appt-updates"
                            checked={settings.appointmentUpdates}
                            onCheckedChange={() => handleToggle('appointmentUpdates')}
                            className="data-[state=checked]:bg-violet-600"
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
}
