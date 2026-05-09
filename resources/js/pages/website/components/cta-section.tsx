import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

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
                        Ready to simplify your property management?
                    </h2>
                    <p
                        className="mx-auto mt-6 max-w-xl text-lg text-white/80"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Join thousands of landlords and tenants who trust Estate to run their
                        properties. Start free — no credit card required.
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-wide text-[#1A1A2E] shadow-lg shadow-black/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/15"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Get Started For Free
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
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:border-white/60 hover:bg-white/10"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
