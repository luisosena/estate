import { posthog } from '@/lib/posthog';

/**
 * Minimal hook for manual PostHog event tracking from React components.
 *
 * @example
 * const { capture } = usePostHog();
 * capture('clicked_export', { format: 'csv' });
 */
export function usePostHog() {
    return {
        posthog,
        capture(eventName: string, properties?: Record<string, unknown>) {
            if (typeof window !== 'undefined') {
                posthog.capture(eventName, properties);
            }
        },
        identify(distinctId: string, properties?: Record<string, unknown>) {
            if (typeof window !== 'undefined') {
                posthog.identify(distinctId, properties);
            }
        },
    };
}
