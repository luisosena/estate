import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { initializeTheme } from './hooks/use-appearance';
import { initPostHog, posthog } from './lib/posthog';
import './echo';
import type { SharedData } from './types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        initPostHog();

        router.on('navigate', (event) => {
            const page = event.detail.page;
            const shared = page.props as unknown as SharedData;
            const user = shared.auth?.user;

            if (shared.isDemoUser) {
                return;
            }

            posthog.capture('$pageview', {
                $current_url: page.url,
                inertia_component: page.component,
            });

            if (user) {
                posthog.identify(String(user.id), {
                    email: user.email,
                    name: user.name,
                });
            } else {
                posthog.reset();
            }
        });

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
