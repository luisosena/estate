import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Building2, 
    Receipt, 
    Wrench, 
    TrendingUp, 
    ShieldCheck,
    Zap,
    ArrowUpRight,
    Lock
} from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            {/* Background gradient & silhouette */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F5E6D3] via-[#FAF7F2] to-[#FAF7F2]">
                <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-[#D4A853]/8 blur-3xl" />
                <div className="absolute bottom-10 left-[5%] h-56 w-56 rounded-full bg-[#C4775A]/6 blur-3xl" />
                
                {/* Atmospheric skyline silhouette */}
                <svg
                    className="absolute bottom-0 w-full opacity-[0.04]"
                    viewBox="0 0 1440 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path d="M0 320V200H40V160H80V240H120V120H180V260H220V100H280V220H340V80H420V240H460V140H520V280H560V180H640V240H680V120H760V260H800V80H880V200H920V140H980V280H1020V160H1100V240H1140V100H1200V220H1260V140H1320V260H1360V180H1400V320H0Z" fill="#1A1A2E" />
                </svg>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    {/* Copy */}
                    <motion.div
                        className="max-w-4xl flex flex-col items-center"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 px-4 py-1.5 animate-pulse"
                        >
                            <span className="text-[#D4A853]">✦</span>
                            <span
                                className="text-xs font-semibold tracking-wider uppercase text-[#D4A853]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Private Pilot Rolling-Launch
                            </span>
                        </motion.div>

                        <h1
                            className="text-4xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-7xl"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Unified Property Operations.<br />
                            <span className="relative">
                                Built for portfolios
                                <svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="none"
                                >
                                    <motion.path
                                        d="M2 8C50 3 100 2 150 4C200 6 250 3 298 7"
                                        stroke="#D4A853"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                                    />
                                </svg>
                            </span>{' '}
                            in East Africa.
                        </h1>

                        <p
                            className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#1A1A2E]/70"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Automate rent reconciliation, utility tracking, and maintenance SLAs on one secure platform.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/register"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-4 text-sm font-semibold tracking-wide text-[#FAF7F2] transition-all duration-300 hover:bg-[#2A2A4E] hover:border-black hover:-translate-y-0.5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Request Pilot Access
                                <svg
                                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <a
                                href="#briefing"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#1A1A2E]/15 px-8 py-4 text-sm font-semibold tracking-wide text-[#1A1A2E] transition-all duration-300 hover:border-[#1A1A2E]/30 hover:bg-[#1A1A2E]/5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Schedule Executive Briefing
                            </a>
                        </div>
                    </motion.div>

                    {/* Logo Strip */}
                    <motion.div 
                        className="mt-16 flex flex-col items-center opacity-60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <p className="text-xs font-bold tracking-widest uppercase text-[#1A1A2E]/60 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Designed for modern real estate operations in East Africa
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 grayscale">
                            <span className="text-xl font-bold font-serif text-[#1A1A2E]">Oaks&Co</span>
                            <span className="text-xl font-extrabold tracking-tighter text-[#1A1A2E]">LUMEN</span>
                            <span className="text-xl font-light tracking-widest text-[#1A1A2E]">VERTEX</span>
                            <span className="text-xl font-medium italic text-[#1A1A2E]">Pinnacle</span>
                            <span className="text-xl font-black tracking-tight text-[#1A1A2E]">NEXUS</span>
                        </div>
                    </motion.div>

                    {/* Side-by-Side Dashboard Mockup Container */}
                    <motion.div
                        className="relative mt-16 sm:mt-24 w-full max-w-[1200px] flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-6 xl:gap-8"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 45, damping: 20, delay: 0.4 }}
                    >
                        {/* 1. LANDLORD DESKTOP VIEW (Left Pane) */}
                        <div className="flex-1 w-full overflow-hidden rounded-2xl border border-black bg-white transition-all duration-300">
                            {/* Browser Header Chrome */}
                            <div className="flex items-center gap-2 border-b border-[#1A1A2E]/5 bg-[#FAFAFA] px-4 py-3">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                                    <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="mx-auto flex-1 flex justify-center">
                                    <div className="w-80 rounded-md bg-[#F0F0F0] px-4 py-1 text-center text-xs text-[#1A1A2E]/50 font-medium select-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        ops.estate.io/dar-portfolio/overview
                                    </div>
                                </div>
                            </div>

                            {/* Landlord Content */}
                            <div className="bg-[#FAF7F2]/50 min-h-[480px] p-4 sm:p-6 text-left flex flex-col md:flex-row gap-6 overflow-hidden relative">
                                {/* Sidebar Mock */}
                                <div className="hidden md:flex flex-col gap-2 w-48 shrink-0 border-r border-[#1A1A2E]/5 pr-4">
                                    <div className="px-3 py-1.5 mb-2">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Operations</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 py-2 px-3 bg-[#1A1A2E] text-white rounded-lg border border-white/20">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="text-xs font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>Overview</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 py-2 px-3 text-[#1A1A2E]/60 hover:bg-[#1A1A2E]/5 rounded-lg transition-colors">
                                        <Building2 className="h-4 w-4" />
                                        <span className="text-xs font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Properties</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 py-2 px-3 text-[#1A1A2E]/60 hover:bg-[#1A1A2E]/5 rounded-lg transition-colors">
                                        <Receipt className="h-4 w-4" />
                                        <span className="text-xs font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Billings</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 py-2 px-3 text-[#1A1A2E]/60 hover:bg-[#1A1A2E]/5 rounded-lg transition-colors">
                                        <Wrench className="h-4 w-4" />
                                        <span className="text-xs font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Work Orders</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 py-2 px-3 text-[#1A1A2E]/60 hover:bg-[#1A1A2E]/5 rounded-lg transition-colors">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-xs font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>Reconciliation</span>
                                    </div>
                                </div>

                                {/* Main Dashboard Ops */}
                                <div className="flex-1 flex flex-col gap-6 transition-all duration-300">
                                    {/* Header info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>Oaks Residency Portfolios</h4>
                                            <p className="text-xs text-[#1A1A2E]/55" style={{ fontFamily: "'Outfit', sans-serif" }}>Live status update • Dar es Salaam, TZ</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#8BA888]/12 text-[#8BA888] rounded-full border border-[#8BA888]/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#8BA888] animate-pulse" />
                                                <span className="text-[10px] font-bold tracking-wide uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>M-Pesa Live Sync</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top KPI row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="rounded-xl border border-black bg-white p-4 relative overflow-hidden">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Monthly Billings</div>
                                            <div className="mt-2 text-2xl font-semibold text-[#1A1A2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>TZS 32.4M</div>
                                            <div className="mt-1 text-[10px] text-[#8BA888] font-semibold flex items-center gap-1">
                                                <span>↑ 8.2% vs last month</span>
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-black bg-white p-4 relative overflow-hidden">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Occupancy Rate</div>
                                            <div className="mt-2 text-2xl font-semibold text-[#D4A853]" style={{ fontFamily: "'DM Serif Display', serif" }}>98.4%</div>
                                            <div className="mt-1 text-[10px] text-[#1A1A2E]/40 font-semibold">62 active tenancies</div>
                                        </div>
                                        <div className="rounded-xl border border-black bg-white p-4 relative overflow-hidden">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Automated Reconciliation</div>
                                            <div className="mt-2 text-2xl font-semibold text-[#8BA888]" style={{ fontFamily: "'DM Serif Display', serif" }}>100%</div>
                                            <div className="mt-1 text-[10px] text-[#8BA888] font-semibold">Direct API validation</div>
                                        </div>
                                    </div>

                                    {/* Bottom Split layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                                        {/* SVG Professional Chart (3 cols) */}
                                        <div className="lg:col-span-3 rounded-xl border border-black bg-white p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[11px] font-bold uppercase tracking-wide text-[#1A1A2E]/60" style={{ fontFamily: "'Outfit', sans-serif" }}>Financial Growth Ledger</span>
                                                <span className="text-[10px] font-semibold text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>Past 6 Months</span>
                                            </div>
                                            <div className="h-44 w-full relative flex items-end">
                                                {/* SVG Path illustration */}
                                                <svg className="absolute inset-0 h-full w-full opacity-90" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <defs>
                                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#D4A853" stopOpacity="0.18" />
                                                            <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M0,80 L20,70 L40,65 L60,40 L80,32 L100,15 L100,100 L0,100 Z" fill="url(#chartGrad)" />
                                                    <path d="M0,80 L20,70 L40,65 L60,40 L80,32 L100,15" fill="none" stroke="#D4A853" strokeWidth="2" strokeLinecap="round" />
                                                    {/* Dots */}
                                                    <circle cx="0" cy="80" r="1.5" fill="#D4A853" />
                                                    <circle cx="20" cy="70" r="1.5" fill="#D4A853" />
                                                    <circle cx="40" cy="65" r="1.5" fill="#D4A853" />
                                                    <circle cx="60" cy="40" r="1.5" fill="#D4A853" />
                                                    <circle cx="80" cy="32" r="1.5" fill="#D4A853" />
                                                    <circle cx="100" cy="15" r="2" fill="#1A1A2E" />
                                                </svg>
                                                {/* Labels */}
                                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none text-[8px] text-[#1A1A2E]/30 font-medium">
                                                    <div className="border-b border-[#1A1A2E]/5 pb-1">TZS 35M</div>
                                                    <div className="border-b border-[#1A1A2E]/5 pb-1">TZS 25M</div>
                                                    <div className="border-b border-[#1A1A2E]/5 pb-1">TZS 15M</div>
                                                </div>
                                                <div className="w-full flex justify-between text-[9px] text-[#1A1A2E]/40 font-semibold pt-2 relative z-10">
                                                    <span>Dec</span>
                                                    <span>Jan</span>
                                                    <span>Feb</span>
                                                    <span>Mar</span>
                                                    <span>Apr</span>
                                                    <span>May</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* East African transaction feed (2 cols) */}
                                        <div className="lg:col-span-2 rounded-xl border border-black bg-white p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[11px] font-bold uppercase tracking-wide text-[#1A1A2E]/60" style={{ fontFamily: "'Outfit', sans-serif" }}>Real-time Feed</span>
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#8BA888]" />
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { desc: 'Oaks Tower, Apt 302', amount: 'TZS 1,800,000', label: 'M-Pesa', status: 'Cleared', color: '#8BA888' },
                                                        { desc: 'Sunrise Apt, Unit 4B', amount: 'TZS 2,400,000', label: 'CRDB Bank', status: 'Cleared', color: '#8BA888' },
                                                        { desc: 'Downtown Loft, 1C', amount: 'TZS 1,200,000', label: 'Airtel Money', status: 'Pending', color: '#D4A853' },
                                                    ].map((tx, idx) => (
                                                        <div key={idx} className="flex justify-between items-center border-b border-[#1A1A2E]/5 pb-2.5 last:border-0 last:pb-0">
                                                            <div className="text-left">
                                                                <div className="text-[10px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>{tx.desc}</div>
                                                                <div className="text-[8px] text-[#1A1A2E]/50 font-medium mt-0.5">{tx.label}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[10px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>{tx.amount}</div>
                                                                <span 
                                                                    className="inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5"
                                                                    style={{ backgroundColor: `${tx.color}15`, color: tx.color }}
                                                                >
                                                                    {tx.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom bleeding layout shadow */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        </div>

                        {/* 2. TENANT PORTAL EXPERIENCE (Right Pane - Mobile View) */}
                        <div className="w-full max-w-[310px] rounded-[36px] border-[6px] border-[#1A1A2E] bg-[#FAF7F2] transition-all duration-300 relative flex flex-col shrink-0">
                            {/* Mobile Speaker / Camera Notch */}
                            <div className="absolute top-0 inset-x-0 h-6 bg-[#1A1A2E] flex justify-center items-center z-20">
                                <div className="w-24 h-4 rounded-full bg-black/60 flex items-center justify-center">
                                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                                </div>
                            </div>

                            <div className="pt-8 p-4 text-left flex flex-col gap-4">
                                {/* Welcome bar */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-[10px] text-[#1A1A2E]/50 font-bold uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>Resident Portal</div>
                                        <h5 className="text-sm font-extrabold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome, Daniel</h5>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-[10px]">
                                        DK
                                    </div>
                                </div>

                                {/* Balance card */}
                                <div className="rounded-2xl bg-[#1A1A2E] p-4 text-white border border-white/20 relative overflow-hidden">
                                    <div className="text-[9px] uppercase tracking-widest text-white/50 font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Outstanding Balance</div>
                                    <div className="mt-1 text-lg font-bold font-serif text-[#D4A853]">TZS 1,200,000</div>
                                    <div className="mt-0.5 text-[8px] text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Due Date: June 1, 2026</div>
                                    
                                    <button className="mt-4 w-full bg-[#D4A853] hover:bg-[#c29642] text-[#1A1A2E] text-[10px] font-bold tracking-wide uppercase py-2.5 rounded-xl transition-all flex items-center justify-center gap-1">
                                        Pay rent via M-Pesa
                                        <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                    <div className="mt-2 text-center text-[7px] text-white/40 flex items-center justify-center gap-1">
                                        <Lock className="h-2 w-2" /> Encrypted API Connection
                                    </div>
                                </div>

                                {/* Utility Widget (LUKU Token) */}
                                <div className="rounded-xl border border-black bg-white p-3.5">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded bg-[#D4A853]/10 flex items-center justify-center">
                                                <Zap className="h-3.5 w-3.5 text-[#D4A853]" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>LUKU Electricity</div>
                                                <div className="text-[8px] text-[#1A1A2E]/40 font-medium font-mono">2419-5829-19</div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>32.4 kWh</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button className="flex-1 bg-[#1A1A2E]/5 hover:bg-[#1A1A2E]/8 text-[#1A1A2E]/80 text-[8px] font-bold py-1.5 rounded-lg transition-colors">
                                            Buy Tokens
                                        </button>
                                        <button className="flex-1 border border-[#1A1A2E]/10 text-[#1A1A2E]/60 text-[8px] font-bold py-1.5 rounded-lg hover:bg-[#1A1A2E]/5 transition-colors">
                                            History
                                        </button>
                                    </div>
                                </div>

                                {/* Maintenance ticket tracking */}
                                <div className="rounded-xl border border-black bg-white p-3.5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>Active Service Request</span>
                                        <span className="inline-block text-[7px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#C4775A]/12 text-[#C4775A]">DISPATCHED</span>
                                    </div>
                                    <div className="text-[9px] text-[#1A1A2E]/80 font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>Kitchen Faucet Leaking</div>
                                    <div className="text-[8px] text-[#1A1A2E]/40 font-medium mt-0.5">Ticket #WO-4921 • Plumber scheduled today</div>
                                    
                                    <div className="mt-3 h-1 w-full bg-[#1A1A2E]/5 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3 bg-[#C4775A]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Operational Badge */}
                        <motion.div
                            className="hidden xl:flex absolute bottom-24 -left-12 rounded-xl border border-black bg-white p-4 z-20"
                            initial={{ opacity: 0, x: -20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: 1.6 }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8BA888]/15">
                                    <ShieldCheck className="h-6 w-6 text-[#8BA888]" />
                                </div>
                                <div className="pr-2 text-left">
                                    <div className="text-sm font-bold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Regulatory Audits Enabled
                                    </div>
                                    <div className="text-xs text-[#1A1A2E]/50 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        EFD-Compliant Ledger Reconciliation
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
