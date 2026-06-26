import { Link } from '@inertiajs/react';

const footerLinks = {
    Product: [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Mobile App', href: '/resources/mobile-app' },
    ],
    Resources: [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Help Center', href: '#' },
    ],
    Company: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-foreground text-primary-foreground/60">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="text-xl font-extralight uppercase tracking-[0.3em] text-primary-foreground">
                                Estate
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-primary-foreground/40">
                            The modern property management platform for landlords, tenants, and
                            property managers. Simplifying operations, one building at a time.
                        </p>

                        <div className="mt-6 flex gap-4">
                            {[
                                {
                                    label: 'Twitter',
                                    icon: (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'LinkedIn',
                                    icon: (
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    ),
                                },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/5 text-primary-foreground/40 transition-all duration-300 hover:bg-primary-foreground/10 hover:text-primary-foreground/70"
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/70">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith('/') ? (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-primary-foreground/40 transition-colors duration-200 hover:text-primary-foreground/70"
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-sm text-primary-foreground/40 transition-colors duration-200 hover:text-primary-foreground/70"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/8 pt-8 sm:flex-row">
                    <p className="text-xs text-primary-foreground/30">
                        &copy; {new Date().getFullYear()} Estate. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="/terms"
                            className="text-xs text-primary-foreground/30 transition-colors duration-200 hover:text-primary-foreground/50"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-xs text-primary-foreground/30 transition-colors duration-200 hover:text-primary-foreground/50"
                        >
                            Privacy Policy
                        </Link>
                        <a
                            href="#"
                            className="text-xs text-primary-foreground/30 transition-colors duration-200 hover:text-primary-foreground/50"
                        >
                            Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
