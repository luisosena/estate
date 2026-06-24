import { Link } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Minus,
    type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TrendDirection = 'up' | 'down' | 'flat';
type StatusVariant = 'success' | 'warning' | 'destructive' | 'neutral';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
    alert?: boolean;
    className?: string;
    trend?: { label: string; direction?: TrendDirection };
    status?: { label: string; variant: StatusVariant };
}

/**
 * KPI / Metric card (§5.2 of docs/DESIGN_SYSTEM.md).
 * Bordered surface only — no pastel background, no shadow, no colored icon box.
 * Icon sits top-right as a 16px muted glyph.
 * Optional badge slot below the value: `status` (semantic) or `trend` (delta).
 */
export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    alert = false,
    className,
    trend,
    status,
}: MetricCardProps) {
    return (
        <Card
            className={cn(
                'gap-3 p-5 transition-colors hover:border-foreground/20',
                alert && 'border-warning/50',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {title}
                </span>
                <Icon
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                />
            </div>
            <div className="text-2xl font-medium leading-tight tracking-tight tabular-nums text-foreground">
                {value}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {status ? (
                    <Badge variant={status.variant} className="text-[11px]">
                        {status.label}
                    </Badge>
                ) : trend ? (
                    <Badge
                        variant={
                            trend.direction === 'up'
                                ? 'success'
                                : trend.direction === 'down'
                                    ? 'destructive'
                                    : 'neutral'
                        }
                        className="gap-1 text-[11px]"
                    >
                        {trend.direction === 'up' ? (
                            <ArrowUpRight className="h-3 w-3" />
                        ) : trend.direction === 'down' ? (
                            <ArrowDownRight className="h-3 w-3" />
                        ) : (
                            <Minus className="h-3 w-3" />
                        )}
                        {trend.label}
                    </Badge>
                ) : null}
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
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

/**
 * Flat tile / quick-access link (§5.6).
 * Bordered outline button with a primary-tinted icon box, label, and a
 * trailing chevron that nudges right on hover.
 */
export function QuickAction({
    label,
    icon: Icon,
    onClick,
    href,
    className,
    disabled,
}: QuickActionProps) {
    const content: ReactNode = (
        <span className="flex w-full items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span className="flex-1 text-left text-sm font-medium text-foreground">
                {label}
            </span>
            <ArrowRight
                className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
            />
        </span>
    );

    const baseClass = cn(
        'group h-auto justify-between px-4 py-3 font-normal shadow-none',
        'hover:border-foreground/20 hover:bg-accent/40',
        className,
    );

    if (href) {
        return (
            <Button
                asChild
                variant="outline"
                className={baseClass}
                disabled={disabled}
            >
                <Link href={href}>{content}</Link>
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            className={baseClass}
            onClick={onClick}
            disabled={disabled}
        >
            {content}
        </Button>
    );
}
