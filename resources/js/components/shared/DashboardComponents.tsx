import { Link } from '@inertiajs/react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AccentColor = 'emerald' | 'blue' | 'violet' | 'amber' | 'red';

const ACCENT_BORDER: Record<AccentColor, string> = {
  emerald: 'border-t-emerald-500',
  blue: 'border-t-blue-500',
  violet: 'border-t-violet-500',
  amber: 'border-t-amber-500',
  red: 'border-t-red-500',
};

const ACCENT_ICON: Record<AccentColor, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  alert?: boolean;
  className?: string;
  accent?: AccentColor;
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
  accent = 'emerald',
  trend,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'group border-t-2 border-border/50 shadow-none transition-all hover:shadow-sm',
        ACCENT_BORDER[accent],
        className,
      )}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md',
                alert
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                  : ACCENT_ICON[accent],
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            {title}
          </span>
          {trend && (
            <Badge
              variant="secondary"
              className="hidden bg-muted/50 text-xs font-normal shadow-none sm:inline-flex"
            >
              {trend.label}
            </Badge>
          )}
        </div>
        <div>
          <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
            {value}
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
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

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  href,
  className,
}: QuickActionProps) {
  const content = (
    <div className="flex flex-col items-start gap-2">
      <div className="rounded-md bg-muted/50 p-2 text-muted-foreground transition-colors group-hover:text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );

  const baseClass = cn(
    'h-auto justify-start rounded-xl border-border/50 bg-card px-4 py-3 shadow-none transition-all hover:bg-muted/50 hover:text-primary',
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
