import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const cards = [
    {
        pain: 'Data Overload',
        headline: 'Less chaos. More control. All in one place.',
        solutions: ['Investor-Grade Dashboards', 'Clean Data Visualizations'],
        style: 'bg-white border-l-4 border-[#D4A853] shadow-sm',
        textStyle: 'text-[#1A1A2E]',
        pillStyle: 'bg-[#1A1A2E]/5 text-[#1A1A2E]/60',
        featurePillStyle: 'bg-[#D4A853]/10 text-[#D4A853]',
    },
    {
        pain: 'Workload Anxiety',
        headline: 'Your business, on autopilot.',
        solutions: ['Automated Workflows', 'Intelligent Task Scheduling'],
        style: 'bg-[#1A1A2E]/[0.03] border border-transparent shadow-none',
        textStyle: 'text-[#1A1A2E]',
        pillStyle: 'bg-white text-[#1A1A2E]/60',
        featurePillStyle: 'bg-[#1A1A2E]/10 text-[#1A1A2E]/70',
    },
    {
        pain: 'Financial Leakage',
        headline: 'Every tenant, every unit, every cent — finally under control.',
        solutions: ['Mobile Payment Gateways', 'Bank Reconciliation', 'Financial Reports'],
        style: 'bg-[#D4A853]/[0.08] border border-transparent relative overflow-hidden',
        textStyle: 'text-[#1A1A2E]',
        pillStyle: 'bg-white/60 text-[#1A1A2E]/60',
        featurePillStyle: 'bg-white text-[#D4A853]',
        accent: (
            <svg className="absolute -right-4 -top-4 h-24 w-24 text-[#D4A853] opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        pain: 'Communication Chaos',
        headline: 'No more missed messages.',
        solutions: ['In-App Messaging', 'Push Notifications', 'Email Logs'],
        style: 'bg-white border border-[#C4775A]/20 shadow-sm',
        textStyle: 'text-[#1A1A2E]',
        pillStyle: 'bg-[#C4775A]/10 text-[#C4775A]',
        featurePillStyle: 'bg-[#C4775A]/10 text-[#C4775A]',
    },
    {
        pain: 'Maintenance Tracking',
        headline: 'Report it. Track it. Fix it.',
        solutions: ['Photo-Verified Reporting', 'Vendor Dispatch', 'Asset Lifecycle'],
        style: 'bg-[#8BA888]/[0.08] border border-transparent relative overflow-hidden',
        textStyle: 'text-[#1A1A2E]',
        pillStyle: 'bg-white/60 text-[#1A1A2E]/60',
        featurePillStyle: 'bg-white text-[#8BA888]',
        accent: (
            <svg className="absolute -bottom-8 -right-8 h-40 w-40 text-[#8BA888] opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        pain: 'Onboarding Friction',
        headline: 'Switch in minutes. Not months.',
        solutions: ['Excel Migration', 'Automated Data Mapping', 'Portfolio Import'],
        style: 'bg-[#1A1A2E] border border-transparent shadow-xl',
        textStyle: 'text-white',
        pillStyle: 'bg-white/10 text-white/60',
        featurePillStyle: 'bg-white/10 text-white',
    },
];

export default function PainSolutionSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative bg-[#FAF7F2] py-24 lg:py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center mb-16 lg:mb-24"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2
                        className="text-4xl font-normal text-[#1A1A2E] sm:text-5xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Built around the problems you actually face.
                    </h2>
                </motion.div>

                {/* Staggered Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:gap-8 items-start">
                    {cards.map((card, i) => {
                        // Create stagger effect by adding top margin to right column on desktop
                        const isRightCol = i % 2 !== 0;
                        
                        return (
                            <motion.div
                                key={i}
                                className={cn(
                                    "p-8 lg:p-10 rounded-2xl flex flex-col h-full transition-transform hover:-translate-y-1 duration-300",
                                    card.style,
                                    isRightCol ? "md:mt-16" : ""
                                )}
                                initial={{ opacity: 0, y: 40 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                            >
                                {card.accent && card.accent}
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="mb-6">
                                        <span 
                                            className={cn(
                                                "inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase",
                                                card.pillStyle
                                            )}
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            {card.pain}
                                        </span>
                                    </div>
                                    
                                    <h3 
                                        className={cn(
                                            "text-3xl font-normal mb-10 flex-1",
                                            card.textStyle
                                        )}
                                        style={{ fontFamily: "'DM Serif Display', serif" }}
                                    >
                                        {card.headline}
                                    </h3>
                                    
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        {card.solutions.map((solution, idx) => (
                                            <span 
                                                key={idx}
                                                className={cn(
                                                    "inline-flex rounded-md px-2.5 py-1 text-xs font-medium",
                                                    card.featurePillStyle
                                                )}
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
