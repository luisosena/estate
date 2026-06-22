import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { type SharedData } from '@/types';

export function useDemoGuard() {
    const { isDemoUser } = usePage<SharedData>().props;

    const guardAction = useCallback(
        (action: () => void): boolean => {
            if (!isDemoUser) {
                action();
                return true;
            }

            toast.error('This action is disabled in demo mode. Sign up to continue!');
            return false;
        },
        [isDemoUser],
    );

    return { isDemoUser, guardAction };
}