import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    Clock,
    Wallet,
    MessageSquare,
    Wrench,
    Upload,
} from 'lucide-react';

const painPoints = [
    {
        title: 'Workload Anxiety',
        headline: 'Automate the busywork. Focus on growth.',
        description: 'Chasing tenants, drafting notices, and writing reminders drains your executive focus. Estate automates routine communications so you can think strategically.',
        icon: Clock,
        color: '#C4775A',
        bgColor: '#FCF9F6',
        iconBg: '#FAF2ED',
    },
    {
        title: 'Financial Leakage',
        headline: 'Track every single cent.Stop losing money.',
        description: 'Unlogged expenses, untracked water bills, and forgotten late fees dissolve your margins. Monitor payments with complete real-time ledger accounting.',
        icon: Wallet,
        color: '#8BA888',
        bgColor: '#F7FAF7',
        iconBg: '#F1F7F1',
    },
    {
        title: 'Communication Chaos',
        headline: 'Every resident interaction, logged & auditable.',
        description: 'Stop digging through scattered emails, personal WhatsApp messages, and SMS history. Keep your landlord-tenant communications secure, indexed, and searchable.',
        icon: MessageSquare,
        color: '#C4775A',
        bgColor: '#FCF9F6',
        iconBg: '#FAF2ED',
    },
    {
        title: 'Maintenance Tracking',
        headline: 'Report it. Dispatched. Resolved.',
        description: 'Tenants log work orders with photos directly from their portal. You assign local vendors, track dispatch statuses, and log repair expenditures seamlessly.',
        icon: Wrench,
        color: '#1E88E5',
        bgColor: '#F4F9FD',
        iconBg: '#E8F4FD',
    },
    {
        title: 'Onboarding Friction',
        headline: 'Seamless migration. Zero operational downtime.',
        description: 'Moving systems should not paralyze your business. Our onboarding integration engineers handle 100% of your initial Excel portfolio imports and unit setups.',
        icon: Upload,
        color: '#8BA888',
        bgColor: '#F7FAF7',
        iconBg: '#F1F7F1',
    },
    {
        title: 'Data Overload',
        headline: 'One dashboard. Total portfolio control.',
        description: 'Stop juggling scattered spreadsheets, physical notes, and WhatsApp logs. See every property, resident, and shilling in a single unified operating center.',
        icon: BarChart3,
        color: '#D4A853',
        bgColor: '#FDFBF7',
        iconBg: '#FDF8F0',
    },
];

export default function PainSolutionSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative bg-background py-16 lg:py-20 overflow-hidden border-b border-border">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-chart-3/5 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Left-aligned elegant header */}
                <motion.div
                    className="text-left mb-10 lg:mb-12 max-w-4xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-normal text-foreground leading-tight">
                        Built around the problems<br />you actually face
                    </h2>
                </motion.div>

                {/* Main Content Split: 35% Left Column, 65% Right Column */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-12 lg:gap-16 items-stretch">
                    {/* Left Column: Anchor Intro Card */}
                    <motion.div
                        className="relative flex flex-col justify-between bg-muted rounded-[24px] p-8 md:p-10 min-h-[520px] overflow-hidden border border-border"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="relative z-10">
                            <p className="text-foreground/80 text-base leading-relaxed mb-8 font-normal">
                                Property operations are full of hidden friction. Legacy systems demand manual entries, disjointed WhatsApp logs, and continuous tenant chasing. We built Estate to replace these operational hurdles with automation and clarity, saving you time and protecting your margins.
                            </p>
                            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-3 h-auto w-fit transition-all duration-200">
                                View full features
                            </Button>
                        </div>

                        {/* Bottom Graphic: Clean dashboard automation concept */}
                        <div className="absolute bottom-0 left-0 w-full h-[220px] pointer-events-none select-none">
                            <svg viewBox="0 0 360 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    {/* Gradients */}
                                    <linearGradient id="premiumGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#C4775A" stopOpacity="0.15" />
                                        <stop offset="50%" stopColor="#8BA888" stopOpacity="0.05" />
                                        <stop offset="100%" stopColor="#D4A853" stopOpacity="0.15" />
                                    </linearGradient>
                                    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                                        <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.9" />
                                    </linearGradient>
                                    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#C4775A" />
                                        <stop offset="100%" stopColor="#E5A285" />
                                    </linearGradient>
                                    <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#8BA888" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#8BA888" stopOpacity="0.0" />
                                    </linearGradient>

                                    {/* Shadow Filter */}
                                    <filter id="premiumShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
                                        <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1A1A2E" floodOpacity="0.06" />
                                    </filter>
                                </defs>

                                {/* Ambient Glow Background */}
                                <circle cx="180" cy="130" r="100" fill="url(#premiumGlow)" filter="blur(20px)" />

                                {/* Grid Background Lines */}
                                <g stroke="#1A1A2E" strokeWidth="0.5" strokeOpacity="0.03">
                                    <line x1="20" y1="40" x2="340" y2="40" />
                                    <line x1="20" y1="80" x2="340" y2="80" />
                                    <line x1="20" y1="120" x2="340" y2="120" />
                                    <line x1="20" y1="160" x2="340" y2="160" />
                                    <line x1="60" y1="20" x2="60" y2="200" />
                                    <line x1="140" y1="20" x2="140" y2="200" />
                                    <line x1="220" y1="20" x2="220" y2="200" />
                                    <line x1="300" y1="20" x2="300" y2="200" />
                                </g>

                                {/* Main Glassmorphic Panel / Dashboard */}
                                <rect x="40" y="45" width="280" height="175" rx="16" fill="url(#cardBg)" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.06" filter="url(#premiumShadow)" />

                                {/* Browser Toolbar */}
                                <rect x="40" y="45" width="280" height="28" rx="16" fill="#1A1A2E" fillOpacity="0.02" />
                                <circle cx="56" cy="59" r="4.5" fill="#C4775A" fillOpacity="0.8" />
                                <circle cx="68" cy="59" r="4.5" fill="#D4A853" fillOpacity="0.8" />
                                <circle cx="80" cy="59" r="4.5" fill="#8BA888" fillOpacity="0.8" />
                                <rect x="110" y="53" width="140" height="12" rx="6" fill="#1A1A2E" fillOpacity="0.04" />
                                <line x1="40" y1="73" x2="320" y2="73" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.05" />

                                {/* Chart Widget (Left Side of Dashboard) */}
                                <g transform="translate(60, 90)">
                                    {/* Mini Header */}
                                    <rect x="0" y="0" width="45" height="6" rx="3" fill="#1A1A2E" fillOpacity="0.3" />
                                    <rect x="0" y="10" width="80" height="10" rx="4" fill="#1A1A2E" fillOpacity="0.15" />

                                    {/* Chart Graph */}
                                    <path d="M0,75 L0,55 C15,45 25,60 40,35 C55,10 70,45 85,25 C100,5 110,15 120,5 L120,75 Z" fill="url(#chartGrad)" />
                                    <path d="M0,55 C15,45 25,60 40,35 C55,10 70,45 85,25 C100,5 110,15 120,5" stroke="#8BA888" strokeWidth="2.5" strokeLinecap="round" />

                                    {/* Chart Dots & Highlights */}
                                    <circle cx="85" cy="25" r="4" fill="#FFFFFF" stroke="#8BA888" strokeWidth="2.5" />
                                    <circle cx="120" cy="5" r="4" fill="#FFFFFF" stroke="#8BA888" strokeWidth="2.5" />

                                    {/* Dynamic Pulse Ring around the highest point */}
                                    <circle cx="120" cy="5" r="8" stroke="#8BA888" strokeWidth="1" strokeOpacity="0.5" />
                                </g>

                                {/* Notification / Activity Widget (Right Side of Dashboard, overlapping) */}
                                <g transform="translate(200, 105)" filter="url(#premiumShadow)">
                                    {/* Glassmorphic Alert Card */}
                                    <rect x="-10" y="-15" width="120" height="75" rx="12" fill="#FFFFFF" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.05" />

                                    {/* Action Status Bar (Accent Color) */}
                                    <path d="M-9, -14 H109 V-6 H-9 Z" fill="url(#accentGrad)" opacity="0.9" className="rounded-t-lg" style={{ clipPath: "inset(0px round 12px 12px 0px 0px)" }} />

                                    {/* Mini Avatar or Icon */}
                                    <circle cx="12" cy="18" r="9" fill="#C4775A" fillOpacity="0.15" />
                                    <path d="M9 18 L11 20 L15 16" stroke="#C4775A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Text Rows in Alert */}
                                    <rect x="27" y="11" width="65" height="5" rx="2.5" fill="#1A1A2E" fillOpacity="0.35" />
                                    <rect x="27" y="20" width="45" height="4" rx="2" fill="#1A1A2E" fillOpacity="0.15" />

                                    {/* Value badge */}
                                    <rect x="12" y="36" width="80" height="14" rx="7" fill="#FAF2ED" />
                                    <rect x="20" y="41" width="64" height="4" rx="2" fill="#C4775A" fillOpacity="0.75" />
                                </g>

                                {/* Connecting Flow / Sparkle Spark */}
                                <path d="M260 65 L263 71 L269 73 L263 75 L260 81 L257 75 L251 73 L257 71 Z" fill="#D4A853" opacity="0.8" />
                                <path d="M305 190 L307 194 L311 195 L307 196 L305 200 L303 196 L299 195 L303 194 Z" fill="#8BA888" opacity="0.8" />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Right Column: 2x3 Feature Pain-Solution Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 lg:gap-x-16 lg:gap-y-10 py-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {painPoints.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="flex flex-col items-start gap-4">
                                    {/* Icon container */}
                                    <div
                                        className="rounded-xl p-2.5 border border-border shadow-sm"
                                        style={{ backgroundColor: item.iconBg }}
                                    >
                                        <Icon className="h-6 w-6 shrink-0" style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-normal text-foreground mb-2 leading-tight">
                                            {item.headline}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

