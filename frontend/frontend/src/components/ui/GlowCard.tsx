import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlowCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: 'primary' | 'success' | 'warning' | 'accent';
    hover?: boolean;
    onClick?: () => void;
}

const glowStyles = {
    primary: 'hover:shadow-[0_0_30px_hsl(250,84%,54%,0.2)]',
    success: 'hover:shadow-[0_0_30px_hsl(142,76%,36%,0.2)]',
    warning: 'hover:shadow-[0_0_30px_hsl(38,92%,50%,0.2)]',
    accent: 'hover:shadow-[0_0_30px_hsl(172,66%,50%,0.2)]',
};

const borderGradients = {
    primary: 'from-violet-500 via-purple-500 to-fuchsia-500',
    success: 'from-emerald-400 via-green-500 to-teal-500',
    warning: 'from-amber-400 via-orange-500 to-red-400',
    accent: 'from-cyan-400 via-teal-500 to-emerald-400',
};

export function GlowCard({
    children,
    className = '',
    glowColor = 'primary',
    hover = true,
    onClick,
}: GlowCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'relative group rounded-2xl p-[1px] transition-all duration-300',
                hover && 'cursor-pointer hover:-translate-y-1',
                hover && glowStyles[glowColor],
                className
            )}
        >
            {/* Gradient border */}
            <div
                className={cn(
                    'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    borderGradients[glowColor]
                )}
            />

            {/* Card content */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl h-full">
                {children}
            </div>
        </div>
    );
}
