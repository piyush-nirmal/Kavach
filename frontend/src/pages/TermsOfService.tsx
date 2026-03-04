import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
    const navigate = useNavigate();

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
                    Terms of Service
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Last updated: February 2026
                </p>
            </div>

            <div className="relative z-10 px-4 mt-6">
                <Card className="p-6 prose prose-slate prose-sm max-w-none">
                    <h3 className="flex items-center gap-2 font-display font-bold text-slate-800 text-lg mb-4">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        1. Introduction
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        Welcome to the Kavach Immunization App. By signing up and using our services, you agree to comply with and be bound by the following terms and conditions. The Kavach platform provides tools to track your child's immunization schedule, manage appointments, and maintain health records securely.
                    </p>

                    <h3 className="font-display font-bold text-slate-800 text-lg mb-4">
                        2. User Accounts and Responsibilities
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree to provide current and accurate medical information to ensure proper healthcare assistance through our providers.
                    </p>

                    <h3 className="font-display font-bold text-slate-800 text-lg mb-4">
                        3. Privacy Policy
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        We prioritize the security of your family's health data. All personal health information is encrypted and stored according to national healthcare security standards. Please review our Privacy Policy to understand how we collect, use, and share your personal information.
                    </p>

                    <h3 className="font-display font-bold text-slate-800 text-lg mb-4">
                        4. Service Modifications
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                        We reserve the right to modify or discontinue the Service with or without notice to the user. We shall not be liable to you or any third party should we exercise our right to modify or discontinue the Service.
                    </p>
                </Card>
            </div>
        </div>
    );
}
