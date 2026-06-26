import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { TryDemoButton } from '@/components/try-demo-button';
import { Button } from '@/components/ui/button';

export default function CtaSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative overflow-hidden bg-foreground py-24 lg:py-32">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-success/10 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-normal text-primary-foreground leading-tight">
                        Partner with us to modernize your operations.
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-primary-foreground/80">
                        Estate is currently onboarding selective real estate portfolios and asset managers for our rolling-launch pilot.
                        Get in touch to lock in your cohort onboarding and secure dedicated operational support.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            variant="secondary"
                            size="lg"
                            className="group rounded-full bg-primary-foreground px-8 py-6 text-sm font-bold tracking-wide text-foreground border border-black transition-all duration-300 hover:bg-primary-foreground/90"
                        >
                            <Link href="/register">
                                Get Started
                                <svg
                                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </Button>
                        <TryDemoButton
                            variant="outline"
                            size="lg"
                            className="group rounded-full border-2 border-primary-foreground/40 bg-transparent px-8 py-6 text-sm font-bold tracking-wide text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10 hover:-translate-y-0.5"
                            label="Try Demo"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
