import { useEffect, useState } from 'react';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    className?: string;
    children?: React.ReactNode;
    color?: 'primary' | 'success' | 'warning' | 'accent';
}

const colorMap = {
    primary: 'stroke-violet-500',
    success: 'stroke-emerald-500',
    warning: 'stroke-amber-500',
    accent: 'stroke-cyan-500',
};

const bgColorMap = {
    primary: 'stroke-violet-100',
    success: 'stroke-emerald-100',
    warning: 'stroke-amber-100',
    accent: 'stroke-cyan-100',
};

export function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 6,
    className = '',
    children,
    color = 'primary',
}: ProgressRingProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedProgress / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);
        return () => clearTimeout(timer);
    }, [progress]);

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="progress-ring">
                {/* Background circle */}
                <circle
                    className={bgColorMap[color]}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress circle */}
                <circle
                    className={`progress-ring-circle ${colorMap[color]}`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                    }}
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
}
