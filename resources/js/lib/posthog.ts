import posthog from 'posthog-js';

let initialized = false;

/**
 * Initialize the PostHog client. Safe to call multiple times — only the first
 * call takes effect. Guards against SSR (no `window`) and double-init.
 */
export function initPostHog(): void {
    if (initialized || typeof window === 'undefined') {
        return;
    }

    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    if (!apiKey) {
        return;
    }

    posthog.init(apiKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: false, // handled manually via Inertia navigate
        capture_pageleave: true,
        autocapture: true,
        person_profiles: 'identified_only',
        loaded: (ph) => {
            if (import.meta.env.DEV) {
                ph.debug();
            }
        },
    });

    initialized = true;
}

export { posthog };
