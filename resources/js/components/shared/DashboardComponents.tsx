import { Link } from '@inertiajs/react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CardColor = 'purple' | 'peach' | 'lavender' | 'green' | 'blue';

const CARD_COLORS: Record<CardColor, string> = {
  purple: 'bg-[#E6D5FF]',
  peach: 'bg-[#FFE8D6]',
  lavender: 'bg-[#F4E6F0]',
  green: 'bg-[#D4F2E0]',
  blue: 'bg-[#D4F0FF]',
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  alert?: boolean;
  className?: string;
  color?: CardColor;
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
  color = 'purple',
  trend,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-black p-5 transition-all',
        CARD_COLORS[color],
        alert && 'bg-red-100',
        className,
      )}
    >
      <Icon className="h-5 w-5 text-gray-900" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums sm:text-3xl">
          {value}
        </div>
        <div className="text-sm font-semibold text-gray-800">
          {title}
        </div>
        <p className="text-xs font-normal text-gray-600">
          {description}
        </p>
      </div>
      {trend && (
        <Badge
          variant="secondary"
          className="mt-auto self-start bg-white/50 text-xs font-medium text-gray-700 shadow-none"
        >
          {trend.label}
        </Badge>
      )}
    </div>
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
    'h-auto justify-start rounded-xl border border-gray-300 bg-card px-4 py-3 shadow-none transition-all hover:bg-muted/50 hover:text-primary dark:border-gray-600',
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
