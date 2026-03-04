import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, BookOpen, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HelpSupport() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSupportAction = (action: string) => {
        toast({
            title: "Action Initiated",
            description: `Opening ${action} service...`,
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
                    Help & Support
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Get assistance with using the Kavach app
                </p>
            </div>

            <div className="relative z-10 px-4 mt-6 space-y-4">
                <h3 className="font-semibold text-slate-800 text-lg">Contact Us</h3>

                <div className="grid gap-4">
                    <Card className="p-4 flex items-center gap-4 hover:border-violet-300 transition-colors cursor-pointer" onClick={() => handleSupportAction('Live Chat')}>
                        <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-violet-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-800">Live Chat</h4>
                            <p className="text-xs text-muted-foreground">Typical response time: Under 5 mins</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                    </Card>

                    <Card className="p-4 flex items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => handleSupportAction('Phone Support')}>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-800">Call Support</h4>
                            <p className="text-xs text-muted-foreground">Mon-Fri, 9am - 5pm IST</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                    </Card>

                    <Card className="p-4 flex items-center gap-4 hover:border-amber-300 transition-colors cursor-pointer" onClick={() => handleSupportAction('Email Support')}>
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-slate-800">Email Us</h4>
                            <p className="text-xs text-muted-foreground">support@kavach.in</p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                    </Card>
                </div>

                <h3 className="font-semibold text-slate-800 text-lg mt-8 mb-2">Self-Service Resources</h3>

                <Card className="divide-y divide-border overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left" onClick={() => handleSupportAction('FAQs')}>
                        <div className="flex items-center gap-3">
                            <HelpCircle className="h-5 w-5 text-slate-500" />
                            <span className="font-medium text-slate-700">Frequently Asked Questions</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left" onClick={() => handleSupportAction('User guides')}>
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-slate-500" />
                            <span className="font-medium text-slate-700">App User Guide</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                    </button>
                </Card>
            </div>
        </div>
    );
}
