import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const caseStudies = [
    {
        quote: "Deploying the automated M-Pesa ledger reconciliation saved our accounting team 18 hours of bank statement auditing every single month. The API matches incoming mobile transactions to respective apartments instantly.",
        name: 'Dar es Salaam Pilot Group',
        role: 'Oaks Residency — 42 Units Onboarded',
        avatar: 'DS',
        color: '#D4A853',
    },
    {
        quote: "The tenant portal's integrated mobile utility purchase desk drastically reduced utility arrears. Residents pay on time because they can buy their LUKU power tokens and pay bills on a single unified interface.",
        name: 'Arusha Housing Syndicate',
        role: 'Design Advisory Partner — 18 Units',
        avatar: 'AH',
        color: '#8BA888',
    },
    {
        quote: "Having photo-documented maintenance logs matched to live vendor pipelines eliminated double-booked repair dispatches. Our total work order turnaround times collapsed by over 60%.",
        name: 'Nairobi Asset Management',
        role: 'Pre-launch Operations Reviewer',
        avatar: 'NA',
        color: '#C4775A',
    },
];

export default function TestimonialsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative bg-white py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2
                        className="text-3xl font-normal text-[#1A1A2E] sm:text-4xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Operational impact, proven in pre-launch
                    </h2>
                </motion.div>

                {/* Case Study Cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {caseStudies.map((study, i) => (
                        <motion.div
                            key={i}
                            className="relative flex flex-col rounded-2xl border border-black bg-[#FAF7F2]/50 p-8 hover:bg-white transition-all duration-300 hover:border-black"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                        >
                            {/* Quote mark */}
                            <div
                                className="mb-4 text-5xl leading-none opacity-40 select-none"
                                style={{ color: study.color, fontFamily: "'DM Serif Display', serif" }}
                            >
                                &ldquo;
                            </div>

                            <p
                                className="flex-1 text-sm leading-relaxed text-[#1A1A2E]/70"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {study.quote}
                            </p>

                            <div className="mt-8 flex items-center gap-4 border-t border-[#1A1A2E]/5 pt-6">
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white select-none"
                                    style={{ backgroundColor: study.color, fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {study.avatar}
                                </div>
                                <div>
                                    <div
                                        className="font-bold text-sm text-[#1A1A2E]"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {study.name}
                                    </div>
                                    <div
                                        className="text-[10px] font-medium text-[#1A1A2E]/50 mt-0.5"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {study.role}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
