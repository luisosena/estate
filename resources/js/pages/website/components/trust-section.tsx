import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const trustItems = [
    {
        title: 'Bank-Grade Financial Security',
        description:
            'All transactions and ledgers are locked behind AES-256 encryption. Strict multi-tenant structural isolation ensures your portfolio financial data remains secure, compliant, and private.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
        ),
        color: '#8BA888',
    },
    {
        title: 'True Cross-Platform Sync',
        description:
            'Perfect synchronization between rich backoffice web dashboards for asset managers and optimized native mobile interfaces (iOS & Android) for field teams, plumbers, and residents.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
        ),
        color: '#D4A853',
    },
    {
        title: 'White-Glove Integration Support',
        description:
            'Our engineering team handles 100% of your initial Excel portfolio import, automated data validation, and team training to ensure an operational rollout with absolutely zero downtime.',
        icon: (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
        ),
        color: '#C4775A',
    },
];

export default function TrustSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative bg-background py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <p className="mb-4 text-xs font-bold tracking-widest uppercase text-primary">
                        Built for Scale
                    </p>
                    <h2 className="font-display text-3xl font-normal text-foreground sm:text-4xl">
                        Enterprise-ready, from day one
                    </h2>
                </motion.div>

                <div className="mt-16 grid gap-8 lg:grid-cols-3">
                    {trustItems.map((item, i) => (
                        <motion.div
                            key={item.title}
                            className="group relative rounded-2xl border border-border bg-card p-8 text-center transition-all duration-500 hover:border-border"
                            initial={{ opacity: 0, y: 25 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                        >
                            <div
                                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundColor: `${item.color}12`, color: item.color }}
                            >
                                {item.icon}
                            </div>
                            <h3 className="mb-3 text-xl font-normal text-foreground">
                                {item.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
