import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    BarChart3,
    Clock,
    Wallet,
    MessageSquareOff,
    Wrench,
    Upload,
    ArrowLeft,
    ArrowRight,
    Check,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const slides = [
    {
        pain: 'Data Overload',
        headline: 'One dashboard. Total portfolio control.',
        description: 'Stop juggling scattered spreadsheets, physical notes, and WhatsApp logs. See every property, resident, and shilling in a single unified operating center.',
        solutions: ['Investor-Grade Metrics', 'Clean Cashflow Analytics', 'Cross-Portfolio Summaries'],
        icon: BarChart3,
        accentColor: '#D4A853',
        visual: (
            <div className="flex flex-col gap-4 h-full justify-center">
                <div className="bg-white p-4 rounded-xl border border-black">
                    <div className="h-2 w-20 rounded bg-[#1A1A2E]/10 mb-2" />
                    <div className="h-6 w-32 rounded bg-[#D4A853]/15 text-[#D4A853] font-bold text-sm flex items-center px-2">TZS 18,400,000</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-black">
                    <div className="flex justify-between items-center mb-2">
                        <div className="h-2 w-14 rounded bg-[#1A1A2E]/10" />
                        <div className="h-3.5 w-10 rounded bg-[#8BA888]/15" />
                    </div>
                    <div className="h-3 w-full bg-[#1A1A2E]/5 rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-[#8BA888]" />
                    </div>
                </div>
            </div>
        )
    },
    {
        pain: 'Workload Anxiety',
        headline: 'Automate the busywork. Focus on growth.',
        //description: 'Chasing tenants, drafting notices, and writing reminders drains your executive focus. Estate automates routine communications so you can think strategically.',
        solutions: ['Automated Reminders', 'Auto-Invoice Generation', 'Direct Tenant Alerts'],
        icon: Clock,
        accentColor: '#C4775A',
        visual: (
            <div className="flex flex-col gap-3 h-full justify-center">
                {[
                    { label: 'Invoice Generated', time: '1st of Month', status: 'Done', bg: '#8BA888' },
                    { label: 'M-Pesa SMS Alert Sent', time: '5th of Month', status: 'Done', bg: '#8BA888' },
                    { label: 'Late Fee Notice Prepared', time: '7th of Month', status: 'Pending', bg: '#C4775A' }
                ].map((task, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-black flex justify-between items-center">
                        <div>
                            <div className="text-xs font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>{task.label}</div>
                            <div className="text-[9px] text-[#1A1A2E]/50 mt-0.5">{task.time}</div>
                        </div>
                        <span
                            className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${task.bg}15`, color: task.bg }}
                        >
                            {task.status}
                        </span>
                    </div>
                ))}
            </div>
        )
    },
    {
        pain: 'Financial Leakage',
        headline: 'Track every single cent. Close every gap.',
        //description: 'Unlogged expenses, untracked water bills, and forgotten late fees dissolve your margins. Monitor payments with complete real-time ledger accounting.',
        solutions: ['Automated Ledger Balance', 'Integrated Expense Logging', 'Auto-Calculated Late Fees'],
        icon: Wallet,
        accentColor: '#D4A853',
        visual: (
            <div className="flex flex-col gap-4 h-full justify-center">
                <div className="bg-white p-4 rounded-xl border border-black">
                    <div className="text-[10px] font-bold text-[#1A1A2E]/40 uppercase tracking-wide mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Reconciled Ledger</div>
                    <div className="flex items-center justify-between border-b border-[#1A1A2E]/5 pb-2">
                        <span className="text-xs font-semibold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>M-Pesa payment recd.</span>
                        <span className="text-xs font-bold text-[#8BA888]">+ TZS 1.2M</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>Brokerage commission</span>
                        <span className="text-xs font-bold text-[#C4775A]">- TZS 120k</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        pain: 'Communication Chaos',
        headline: 'Every resident interaction, logged & auditable.',
        //description: 'Stop digging through scattered emails, personal WhatsApp messages, and SMS history. Keep your landlord-tenant communications secure, indexed, and searchable.',
        solutions: ['Official Action Tracking', 'Tenant In-App Notices', 'Regulatory Compliance Logs'],
        icon: MessageSquareOff,
        accentColor: '#C4775A',
        visual: (
            <div className="flex flex-col gap-3 h-full justify-center">
                <div className="bg-white p-3 rounded-xl border border-black max-w-[85%] self-start text-left">
                    <div className="text-[8px] font-bold text-[#1A1A2E]/40 uppercase mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Resident (Apt 4B)</div>
                    <p className="text-xs text-[#1A1A2E]/80" style={{ fontFamily: "'Outfit', sans-serif" }}>Is the water bill EFD-compliant?</p>
                </div>
                <div className="bg-[#1A1A2E] p-3 rounded-xl border border-white/20 max-w-[85%] self-end text-left text-white">
                    <div className="text-[8px] font-bold text-white/50 uppercase mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Operations Desk</div>
                    <p className="text-xs text-white/90" style={{ fontFamily: "'Outfit', sans-serif" }}>Yes Daniel, PDF receipt generated automatically.</p>
                </div>
            </div>
        )
    },
    {
        pain: 'Maintenance Tracking',
        headline: 'Report it. Dispatched. Resolved.',
        //description: 'Tenants log work orders with photos directly from their portal. You assign local vendors, track dispatch statuses, and log repair expenditures seamlessly.',
        solutions: ['Photo-Attached Work Orders', 'Local Vendor Dispatch Boards', 'Expense Book Reconciliation'],
        icon: Wrench,
        accentColor: '#8BA888',
        visual: (
            <div className="flex flex-col gap-4 h-full justify-center">
                <div className="bg-white p-4 rounded-xl border border-black">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>Work Order WO-294</span>
                        <span className="h-2 w-2 rounded-full bg-[#D4A853]" />
                    </div>
                    <div className="text-xs text-[#1A1A2E]/80" style={{ fontFamily: "'Outfit', sans-serif" }}>Plumbing: Kitchen Leaks</div>
                    <div className="text-[9px] text-[#1A1A2E]/40 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>Assigned to: Fundi Juma</div>
                </div>
            </div>
        )
    },
    {
        pain: 'Onboarding Friction',
        headline: 'Seamless migration. Zero operational downtime.',
        //description: 'Moving systems should not paralyze your business. Our onboarding integration engineers handle 100% of your initial Excel portfolio imports and unit setups.',
        solutions: ['100% Data Migration Support', 'Excel Mapping Engines', 'Instant Tenant Invitations'],
        icon: Upload,
        accentColor: '#8BA888',
        visual: (
            <div className="flex flex-col gap-3 h-full justify-center items-center">
                <div className="bg-white p-4 rounded-xl border border-black w-full text-center relative overflow-hidden">
                    <div className="flex justify-center mb-2">
                        <Upload className="h-8 w-8 text-[#D4A853]" />
                    </div>
                    <div className="text-xs font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>portfolios_dar.xlsx</div>
                    <div className="text-[9px] text-[#8BA888] mt-1 font-semibold flex items-center justify-center gap-1">
                        <Check className="h-3 w-3" /> Mapping 42 units complete
                    </div>
                </div>
            </div>
        )
    },
];

export default function PainSolutionSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 2400);
        return () => clearInterval(interval);
    }, []);

    const activeSlide = slides[current];
    const IconComponent = activeSlide.icon;

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
                        className="mb-4 text-xs font-bold tracking-widest uppercase text-[#D4A853]"
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
                        className="mt-4 text-base sm:text-lg text-[#1A1A2E]/55"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        We designed Estate to replace physical hurdles with modern operational elegance.
                    </p>
                </motion.div>

                {/* Slideshow Selector Tabs (Clickable navigation list) */}
                <div className="hidden lg:flex justify-center gap-2 mb-10 overflow-x-auto pb-2 relative z-10">
                    {slides.map((slide, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${current === idx
                                ? 'bg-[#1A1A2E] text-white border border-white/20'
                                : 'bg-white border border-[#1A1A2E]/8 text-[#1A1A2E]/55 hover:text-[#1A1A2E] hover:bg-white'
                                }`}
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {slide.pain}
                        </button>
                    ))}
                </div>

                {/* Main Slideshow Frame */}
                <div className="relative mx-auto max-w-4xl min-h-[420px] bg-white rounded-3xl border border-black p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1"
                        >
                            {/* Left Content Side */}
                            <div className="text-left flex flex-col justify-center">
                                <h3
                                    className="text-2xl sm:text-3xl font-normal text-[#1A1A2E] leading-tight mb-4"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    {activeSlide.headline}
                                </h3>

                                {/* Solution Pills */}
                                <div className="flex flex-col gap-2">
                                    {activeSlide.solutions.map((sol, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#1A1A2E]/80">
                                            <div className="h-4.5 w-4.5 rounded-full bg-[#8BA888]/15 flex items-center justify-center text-[#8BA888] shrink-0">
                                                <Check className="h-3 w-3" />
                                            </div>
                                            <span style={{ fontFamily: "'Outfit', sans-serif" }}>{sol}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Visual Side */}
                            <div className="bg-[#FAF7F2] rounded-2xl border border-[#1A1A2E]/5 p-6 h-[260px] flex flex-col justify-center relative overflow-hidden select-none">
                                {/* Small visual chart / mockup representation */}
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <IconComponent className="h-28 w-28 text-[#1A1A2E]" />
                                </div>
                                <div className="relative z-10 w-full">
                                    {activeSlide.visual}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Bottom Controls Panel */}
                    <div className="mt-8 pt-6 border-t border-[#1A1A2E]/5 flex items-center justify-between">
                        {/* Dot Paginations */}
                        <div className="flex gap-2">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${current === idx ? 'w-6 bg-[#1A1A2E]' : 'w-2 bg-[#1A1A2E]/15'
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevSlide}
                                className="h-9 w-9 rounded-full border border-[#1A1A2E]/10 bg-white hover:bg-[#1A1A2E]/5 text-[#1A1A2E] flex items-center justify-center transition-colors"
                                aria-label="Previous Slide"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="h-9 w-9 rounded-full border border-[#1A1A2E]/10 bg-white hover:bg-[#1A1A2E]/5 text-[#1A1A2E] flex items-center justify-center transition-colors"
                                aria-label="Next Slide"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
