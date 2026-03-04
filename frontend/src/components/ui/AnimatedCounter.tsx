import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

export function AnimatedCounter({
    value,
    duration = 1000,
    className = '',
    suffix = '',
    prefix = '',
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = displayValue;
        const difference = value - startValue;

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Easing function (ease-out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);

            const currentValue = Math.round(startValue + difference * easeOut);
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        startTimeRef.current = null;
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, duration]);

    return (
        <span className={`tabular-nums ${className}`}>
            {prefix}{displayValue}{suffix}
        </span>
    );
}
