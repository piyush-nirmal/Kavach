
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui/button";

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };
        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                setSupportsPWA(false);
            }
            setPromptInstall(null);
        });
    };

    if (!supportsPWA) {
        return null;
    }

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <Button
                onClick={onClick}
                variant="default"
                className="shadow-lg animate-in slide-in-from-bottom duration-300 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
                <Download className="w-4 h-4" />
                Install App
            </Button>
        </div>
    );
}
