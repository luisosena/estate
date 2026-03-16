import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <span ref={ref}>
            {isInView ? (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {end.toLocaleString()}{suffix}
                </motion.span>
            ) : (
                '0'
            )}
        </span>
    );
}

const stats = [
    { value: 2500, suffix: '+', label: 'Properties Managed' },
    { value: 15000, suffix: '+', label: 'Tenants Served' },
    { value: 98, suffix: '%', label: 'On-Time Payments' },
    { value: 4.9, suffix: '★', label: 'Average Rating' },
];

export default function SocialProof() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative border-t border-[#1A1A2E]/5 bg-white py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.p
                    className="mb-10 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#1A1A2E]/40"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Trusted by landlords & property managers everywhere
                </motion.p>

                <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <div
                                className="text-3xl font-normal text-[#1A1A2E] lg:text-4xl"
                                style={{ fontFamily: "'DM Serif Display', serif" }}
                            >
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div
                                className="mt-2 text-sm text-[#1A1A2E]/50"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
