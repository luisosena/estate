import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { type SharedData } from '@/types';

function formatRemaining(ms: number): string {
    if (ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function DemoBanner() {
    const { isDemoUser, demoExpiresAt } = usePage<SharedData>().props;

    const [now, setNow] = useState(() => Date.now());
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (!isDemoUser || !demoExpiresAt) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [isDemoUser, demoExpiresAt]);

    const remainingMs = useMemo(() => {
        if (!demoExpiresAt) return 0;
        return new Date(demoExpiresAt).getTime() - now;
    }, [demoExpiresAt, now]);

    const isExpiringSoon = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

    if (!isDemoUser || dismissed || !demoExpiresAt || remainingMs <= 0) {
        return null;
    }

    return (
        <div
            role="status"
            className={`sticky top-0 z-50 flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                isExpiringSoon
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
        >
            <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-semibold">You're exploring the demo.</span>
                    <span className="text-xs opacity-90 sm:text-sm">
                        Read-only access expires in{' '}
                        <span className="font-mono font-bold tabular-nums">
                            {formatRemaining(remainingMs)}
                        </span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <Button
                    asChild
                    size="sm"
                    variant={isExpiringSoon ? 'default' : 'outline'}
                    className="h-8 rounded-full px-4 text-xs font-semibold"
                >
                    <Link href="/register">Sign up to keep exploring</Link>
                </Button>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Dismiss demo banner"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}