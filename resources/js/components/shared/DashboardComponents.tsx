import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
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
        <Card className={cn("shadow-none border-border/50 group hover:border-primary/20 transition-colors", className)}>
            <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", alert ? 'text-red-500' : 'text-primary/70')} />
                        {title}
                    </span>
                    {trend && (
                        <Badge variant="secondary" className="bg-muted/50 font-normal shadow-none text-xs hidden sm:inline-flex">
                            {trend.label}
                        </Badge>
                    )}
                </div>
                <div>
                    <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
                        {value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

interface QuickActionProps {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    href?: string;
    className?: string;
    disabled?: boolean;
}

import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export function QuickAction({
    label,
    icon: Icon,
    onClick,
    href,
    className,
}: QuickActionProps) {
    const content = (
        <div className="flex flex-col items-start gap-2">
            <div className="p-2 rounded-md bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">{label}</span>
        </div>
    );

    const baseClass = cn(
        "h-auto py-3 px-4 justify-start bg-card hover:bg-muted/50 border-border/50 shadow-none hover:text-primary transition-all rounded-xl",
        className
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
