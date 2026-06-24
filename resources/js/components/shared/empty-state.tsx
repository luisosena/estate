import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
    label: string;
    href?: string;
    onClick?: () => void;
}

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: EmptyStateAction;
    className?: string;
}

/**
 * Centered empty state (§3.10).
 * 64px icon area, 15px medium title, 13px muted description, outline action.
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center py-16 px-6',
                className,
            )}
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center text-muted-foreground">
                <Icon className="h-12 w-12" aria-hidden="true" />
            </div>
            <p className="text-md mb-1 font-medium text-foreground">{title}</p>
            {description ? (
                <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                    {description}
                </p>
            ) : null}
            {action ? (
                <Button
                    variant="outline"
                    asChild={Boolean(action.href)}
                    onClick={action.onClick}
                >
                    {action.href ? (
                        <Link href={action.href}>{action.label}</Link>
                    ) : (
                        action.label
                    )}
                </Button>
            ) : null}
        </div>
    );
}
