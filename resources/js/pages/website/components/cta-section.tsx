import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

export default function CtaSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#1A1A2E] py-24 lg:py-32">
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
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-[#D4A853]/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#8BA888]/10 blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2
                        className="text-3xl font-normal text-white sm:text-4xl lg:text-5xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Partner with us to modernize your operations.
                    </h2>
                    <p
                        className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/80"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Estate is currently onboarding selective real estate portfolios and asset managers for our rolling-launch pilot.
                        Get in touch to lock in your cohort onboarding and secure dedicated operational support.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            asChild
                            variant="secondary"
                            size="lg"
                            className="group rounded-full bg-white px-8 py-6 text-sm font-bold tracking-wide text-[#1A1A2E] border border-black transition-all duration-300 hover:bg-white/90"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
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
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
