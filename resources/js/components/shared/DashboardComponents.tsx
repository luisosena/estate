import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
    alert?: boolean;
    className?: string;
    trend?: {
        label: string;
        value: string;
    };
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    alert = false,
    className,
    trend,
}: MetricCardProps) {
    return (
        <Card
            className={cn(
                'gap-2 py-5 shadow-none',
                alert && 'border-destructive/30 bg-destructive/5',
                className,
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-0">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {title}
                </span>
                <div
                    className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md',
                        alert
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary/10 text-primary',
                    )}
                >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 px-5">
                <div className="text-2xl font-semibold tracking-tight tabular-nums">
                    {value}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && (
                    <Badge variant="secondary" className="mt-2 self-start text-xs font-medium">
                        {trend.label}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
}

interface QuickActionProps {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    href?: string;
    className?: string;
    disabled?: boolean;
}

export function QuickAction({
    label,
    icon: Icon,
    onClick,
    href,
    className,
}: QuickActionProps) {
    const content: ReactNode = (
        <span className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{label}</span>
        </span>
    );

    const baseClass = cn(
        'h-auto justify-start px-4 py-3 shadow-none',
        className,
    );

    if (href) {
        return (
            <Button asChild variant="outline" className={baseClass}>
                <Link href={href}>{content}</Link>
            </Button>
        );
    }

    return (
        <Button variant="outline" className={baseClass} onClick={onClick}>
            {content}
        </Button>
    );
}
