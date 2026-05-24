import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
    {
        title: 'For Landlords',
        description:
            'Full portfolio oversight — properties, units, tenants, and financials in a single dashboard. Track occupancy, manage leases, and monitor revenue effortlessly.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
        ),
        color: '#D4A853',
        bgColor: '#D4A853',
    },
    {
        title: 'For Tenants',
        description:
            'Pay rent online, submit maintenance requests, view lease details, and communicate with your landlord — all from your personal portal, anytime.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
        ),
        color: '#C4775A',
        bgColor: '#C4775A',
    },
    {
        title: 'For Everyone',
        description:
            'Real-time notifications, transparent payment history, utility tracking, and a beautifully designed experience that keeps everyone on the same page.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
        ),
        color: '#8BA888',
        bgColor: '#8BA888',
    },
];

export default function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="features" ref={ref} className="relative bg-[#FAF7F2] py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p
                        className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4A853]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Platform Features
                    </p>
                    <h2
                        className="text-3xl font-normal text-[#1A1A2E] sm:text-4xl lg:text-5xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        One platform, everyone&apos;s needs
                    </h2>
                    <p
                        className="mt-4 text-lg text-[#1A1A2E]/55"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Whether you own one unit or a hundred, Estate gives every stakeholder the tools they need.
                    </p>
                </motion.div>

                {/* Feature cards */}
                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="group relative overflow-hidden rounded-2xl border border-black bg-white p-8 transition-all duration-500 hover:border-black"
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                        >
                            {/* Hover gradient overlay */}
                            <div
                                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${feature.bgColor}08, transparent 60%)`,
                                }}
                            />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div
                                    className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110"
                                    style={{
                                        backgroundColor: `${feature.color}12`,
                                        color: feature.color,
                                    }}
                                >
                                    {feature.icon}
                                </div>

                                <h3
                                    className="mb-3 text-xl font-normal text-[#1A1A2E]"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    {feature.title}
                                </h3>

                                <p
                                    className="text-sm leading-relaxed text-[#1A1A2E]/55"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {feature.description}
                                </p>

                                {/* Arrow link */}
                                <div
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group-hover:gap-3"
                                    style={{ color: feature.color, fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Learn more
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
