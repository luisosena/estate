import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { RefreshCw, Zap, Wrench, Shield } from 'lucide-react';

const pillars = [
    {
        title: '100% Automated Reconciliation',
        description: 'Direct API integrations match M-Pesa statements and bank ledgers to properties in real-time, eliminating auditing hours.',
        icon: RefreshCw,
        color: '#D4A853',
    },
    {
        title: '0.0% Lost Utility Invoicing',
        description: 'Dynamic SMS and tenant portal bills push electricity (LUKU) and water tallies automatically, preventing unpaid arrears.',
        icon: Zap,
        color: '#8BA888',
    },
    {
        title: 'Real-Time Maintenance SLAs',
        description: 'Photo-verified reporting links residents directly with local vendor status boards and automated maintenance logging.',
        icon: Wrench,
        color: '#C4775A',
    },
    {
        title: 'Enterprise Data Isolation',
        description: 'Institutional-grade data protection, secure database isolation, and detailed logs for regulatory operational auditing.',
        icon: Shield,
        color: '#1A1A2E',
    },
];

export default function SocialProof() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative border-t border-[#1A1A2E]/5 bg-white py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    className="mx-auto max-w-3xl text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <p
                        className="text-xs font-bold tracking-widest uppercase text-[#D4A853] mb-3"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Engineered for Operational Excellence
                    </p>
                    <h2
                        className="text-3xl font-normal text-[#1A1A2E] sm:text-4xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Replacing manual chaos with structured integrity.
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {pillars.map((pillar, i) => {
                        const IconComponent = pillar.icon;
                        return (
                            <motion.div
                                key={pillar.title}
                                className="relative rounded-2xl border border-black bg-[#FAF7F2]/40 p-6 transition-all duration-300 hover:border-black hover:bg-white"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl mb-6"
                                    style={{ backgroundColor: `${pillar.color}12`, color: pillar.color }}
                                >
                                    <IconComponent className="h-6 w-6" />
                                </div>
                                <h3
                                    className="text-lg font-bold text-[#1A1A2E] mb-3"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {pillar.title}
                                </h3>
                                <p
                                    className="text-sm text-[#1A1A2E]/60 leading-relaxed"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {pillar.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
