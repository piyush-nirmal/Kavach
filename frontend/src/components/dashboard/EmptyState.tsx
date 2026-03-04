import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
    navigateTo?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    navigateTo
}: EmptyStateProps) {
    const navigate = useNavigate();

    const handleAction = () => {
        if (onAction) onAction();
        if (navigateTo) navigate(navigateTo);
    };

    return (
        <Card className="p-10 text-center overflow-hidden relative bg-gradient-to-br from-background to-background border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors duration-500">
            {/* Soft Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-sm mx-auto"
            >
                <div className="h-24 w-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center shadow-inner relative">
                    <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_4s_linear_infinite]" />
                    <div className="text-primary scale-150">
                        {icon}
                    </div>
                </div>

                <h3 className="font-display font-bold text-slate-900 dark:text-slate-100 text-2xl mb-3">
                    {title}
                </h3>

                <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {description}
                </p>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        onClick={handleAction}
                        className="rounded-full px-8 py-6 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                        size="lg"
                    >
                        {actionIcon && <span className="mr-2">{actionIcon}</span>}
                        {actionLabel}
                    </Button>
                </motion.div>
            </motion.div>
        </Card>
    );
}
