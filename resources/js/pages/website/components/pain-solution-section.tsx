import { motion, useInView } from 'framer-motion';
import {
    BarChart3,
    Clock,
    Wallet,
    MessageSquareOff,
    Wrench,
    Upload,
    ArrowRight,
} from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const cards = [
    {
        pain: 'Data Overload',
        headline: 'One dashboard. Total portfolio control.',
        description: 'Stop juggling spreadsheets and scattered notes. See every property, tenant, and payment in a single unified view.',
        solutions: ['Investor-Grade Dashboards', 'Clean Data Visualizations'],
        icon: BarChart3,
        accentColor: '#D4A853',
        size: 'large',
    },
    {
        pain: 'Workload Anxiety',
        headline: 'Automate the busywork. Focus on growth.',
        description: 'Repetitive tasks drain your time. Estate handles scheduling, reminders, and follow-ups so you can think strategically.',
        solutions: ['Automated Workflows', 'Intelligent Task Scheduling'],
        icon: Clock,
        accentColor: '#C4775A',
        size: 'medium',
    },
    {
        pain: 'Financial Leakage',
        headline: 'Track every cent. Close every gap.',
        description: 'Missed payments and untracked expenses add up fast. Get real-time financial visibility across your entire portfolio.',
        solutions: ['Mobile Payment Gateways', 'Bank Reconciliation', 'Financial Reports'],
        icon: Wallet,
        accentColor: '#D4A853',
        size: 'medium',
    },
    {
        pain: 'Communication Chaos',
        headline: 'Every conversation, logged and tracked.',
        description: 'No more lost emails or forgotten requests. Keep every landlord-tenant interaction organized and searchable.',
        solutions: ['In-App Messaging', 'Push Notifications', 'Email Logs'],
        icon: MessageSquareOff,
        accentColor: '#C4775A',
        size: 'small',
    },
    {
        pain: 'Maintenance Tracking',
        headline: 'Report it. Track it. Fix it.',
        description: 'Tenants report issues with photos. You assign vendors and track progress. Every repair logged to the right property.',
        solutions: ['Photo-Verified Reporting', 'Vendor Dispatch', 'Asset Lifecycle'],
        icon: Wrench,
        accentColor: '#8BA888',
        size: 'small',
    },
    {
        pain: 'Onboarding Friction',
        headline: 'Switch in minutes. Not months.',
        description: 'Migrating from your current system is painless. Import your existing data and start managing from day one.',
        solutions: ['Excel Migration', 'Automated Data Mapping', 'Portfolio Import'],
        icon: Upload,
        accentColor: '#8BA888',
        size: 'medium',
    },
];

const sizeClasses = {
    large: 'md:col-span-2 md:row-span-2',
    medium: 'md:col-span-1 md:row-span-1',
    small: 'md:col-span-1 md:row-span-1',
};

export default function PainSolutionSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative bg-[#FAF7F2] py-24 lg:py-32 overflow-hidden">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#D4A853]/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#8BA888]/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center mb-16 lg:mb-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p
                        className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4A853]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Why Estate Exists
                    </p>
                    <h2
                        className="text-4xl font-normal text-[#1A1A2E] sm:text-5xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Built around the problems you actually face.
                    </h2>
                    <p
                        className="mt-4 text-lg text-[#1A1A2E]/55"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        We built Estate because property management shouldn't feel like a second job.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 auto-rows-[minmax(180px,fr)] gap-5 lg:gap-6">
                    {cards.map((card, i) => {
                        const IconComponent = card.icon;
                        const isLarge = card.size === 'large';

                        return (
                            <motion.div
                                key={i}
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl border border-[#1A1A2E]/5 bg-white p-6 transition-all duration-500 hover:border-[#1A1A2E]/10 hover:shadow-xl hover:shadow-[#1A1A2E]/5 lg:p-8',
                                    sizeClasses[card.size]
                                )}
                                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            >
                                {/* Subtle background accent on hover */}
                                <div
                                    className="absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    style={{ background: `radial-gradient(circle, ${card.accentColor}06, transparent 70%)` }}
                                />

                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Pain label with icon */}
                                    <div className="mb-6">
                                        <span
                                            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wide"
                                            style={{
                                                backgroundColor: `${card.accentColor}10`,
                                                color: card.accentColor,
                                                fontFamily: "'Outfit', sans-serif",
                                            }}
                                        >
                                            <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />
                                            {card.pain}
                                        </span>
                                    </div>

                                    {/* Headline */}
                                    <h3
                                        className={cn(
                                            'font-normal text-[#1A1A2E]',
                                            isLarge ? 'text-3xl sm:text-4xl mb-6' : 'text-2xl sm:text-3xl mb-4'
                                        )}
                                        style={{ fontFamily: "'DM Serif Display', serif" }}
                                    >
                                        {card.headline}
                                    </h3>

                                    {/* Description */}
                                    <p
                                        className={cn(
                                            'text-[#1A1A2E]/60 leading-relaxed',
                                            isLarge ? 'text-base mb-8' : 'text-sm mb-6'
                                        )}
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {card.description}
                                    </p>

                                    {/* Connector arrow */}
                                    <div className="mb-4 flex items-center gap-2">
                                        <div
                                            className="h-px w-8 transition-all duration-300 group-hover:w-12"
                                            style={{ backgroundColor: `${card.accentColor}40` }}
                                        />
                                        <ArrowRight
                                            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                                            style={{ color: `${card.accentColor}80` }}
                                            aria-hidden="true"
                                        />
                                    </div>

                                    {/* Feature pills */}
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {card.solutions.map((solution, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 bg-[#1A1A2E]/5 text-[#1A1A2E]/60 group-hover:bg-[#1A1A2E]/8 group-hover:text-[#1A1A2E]/70"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                {solution}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
