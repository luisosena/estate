import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

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
                        className="max-w-3xl flex flex-col items-center"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 px-4 py-1.5"
                        >
                            <span className="text-[#D4A853]">✦</span>
                            <span
                                className="text-xs font-semibold tracking-wider uppercase text-[#D4A853]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Property Management, Reimagined
                            </span>
                        </motion.div>

                        <h1
                            className="text-5xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-7xl"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Less chaos. More control.<br />
                            <span className="relative">
                                Your entire portfolio
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
                            — in one place.
                        </h1>

                        <p
                            className="mt-8 max-w-2xl text-lg sm:text-xl leading-relaxed text-[#1A1A2E]/60"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            The all-in-one platform for landlords and tenants. Track properties,
                            manage payments, handle maintenance — all from a single beautiful dashboard.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <Link
                                href="/register"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-4 text-sm font-medium tracking-wide text-[#FAF7F2] transition-all duration-300 hover:bg-[#2A2A4E] hover:shadow-xl hover:shadow-[#1A1A2E]/15 hover:-translate-y-0.5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Start free trial
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
                                href="#demo"
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#1A1A2E]/15 px-8 py-4 text-sm font-medium tracking-wide text-[#1A1A2E] transition-all duration-300 hover:border-[#1A1A2E]/30 hover:bg-[#1A1A2E]/5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Book a demo
                            </a>
                        </div>
                    </motion.div>

                    {/* Logo Strip */}
                    <motion.div 
                        className="mt-16 sm:mt-20 flex flex-col items-center opacity-60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ duration: 1, delay: 0.6 }}
                    >
                        <p className="text-xs font-semibold tracking-widest uppercase text-[#1A1A2E]/60 mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Trusted by property managers across Tanzania
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 sm:gap-x-12 grayscale">
                            <span className="text-xl font-bold font-serif text-[#1A1A2E]">Oaks&Co</span>
                            <span className="text-xl font-extrabold tracking-tighter text-[#1A1A2E]">LUMEN</span>
                            <span className="text-xl font-light tracking-widest text-[#1A1A2E]">VERTEX</span>
                            <span className="text-xl font-medium italic text-[#1A1A2E]">Pinnacle</span>
                            <span className="text-xl font-black tracking-tight text-[#1A1A2E]">NEXUS</span>
                        </div>
                    </motion.div>

                    {/* Floating Dashboard Mockup */}
                    <motion.div
                        className="relative mt-16 sm:mt-24 w-full max-w-5xl"
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 40, damping: 20, delay: 0.4 }}
                    >
                        <div className="relative mx-auto">
                            {/* Browser chrome */}
                            <div className="overflow-hidden rounded-t-2xl rounded-b-lg border border-[#1A1A2E]/10 bg-white shadow-2xl shadow-[#1A1A2E]/15">
                                {/* Title bar */}
                                <div className="flex items-center gap-2 border-b border-[#1A1A2E]/5 bg-[#FAFAFA] px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                                        <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                                    </div>
                                    <div className="mx-auto flex-1 flex justify-center">
                                        <div className="w-64 rounded-md bg-[#F0F0F0] px-4 py-1.5 text-center text-xs text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            app.estate.com/dashboard
                                        </div>
                                    </div>
                                </div>
                                {/* Mock dashboard content */}
                                <div className="bg-[#FAF7F2]/50 p-6 sm:p-8 flex flex-col md:flex-row gap-6 h-[400px] overflow-hidden relative">
                                    {/* Sidebar mock */}
                                    <div className="hidden md:flex flex-col gap-4 w-48 border-r border-[#1A1A2E]/5 pr-6">
                                        <div className="h-4 w-24 rounded bg-[#1A1A2E]/10 mb-4" />
                                        <div className="flex items-center gap-3 py-2 px-3 bg-white rounded-md shadow-sm border border-[#1A1A2E]/5">
                                            <div className="h-4 w-4 rounded bg-[#D4A853]" />
                                            <div className="h-3 w-16 rounded bg-[#1A1A2E]/80" />
                                        </div>
                                        <div className="flex items-center gap-3 py-2 px-3">
                                            <div className="h-4 w-4 rounded bg-[#1A1A2E]/20" />
                                            <div className="h-3 w-20 rounded bg-[#1A1A2E]/40" />
                                        </div>
                                        <div className="flex items-center gap-3 py-2 px-3">
                                            <div className="h-4 w-4 rounded bg-[#1A1A2E]/20" />
                                            <div className="h-3 w-14 rounded bg-[#1A1A2E]/40" />
                                        </div>
                                    </div>
                                    
                                    {/* Main content mock */}
                                    <div className="flex-1 flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="h-5 w-40 rounded bg-[#1A1A2E]/10" />
                                                <div className="mt-2 h-3 w-24 rounded bg-[#1A1A2E]/5" />
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="h-10 w-10 rounded-full bg-[#8BA888]/20" />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Total Revenue', value: '$124.5K', color: '#D4A853' },
                                                { label: 'Properties', value: '42', color: '#8BA888' },
                                                { label: 'Occupancy', value: '98%', color: '#1A1A2E' },
                                                { label: 'Maintenance', value: '5 Open', color: '#C4775A' },
                                            ].map((stat, i) => (
                                                <div key={i} className="rounded-xl border border-[#1A1A2E]/5 bg-white p-4 shadow-sm">
                                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {stat.label}
                                                    </div>
                                                    <div className="mt-2 text-2xl sm:text-3xl font-semibold" style={{ color: stat.color, fontFamily: "'DM Serif Display', serif" }}>
                                                        {stat.value}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="flex-1 rounded-xl border border-[#1A1A2E]/5 bg-white p-6 shadow-sm">
                                            <div className="mb-6 flex justify-between items-center">
                                                <div className="h-4 w-32 rounded bg-[#1A1A2E]/10" />
                                                <div className="h-6 w-24 rounded-full bg-[#1A1A2E]/5" />
                                            </div>
                                            <div className="flex items-end gap-2 h-24 sm:h-32">
                                                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 80, 100].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="flex-1 rounded-t-sm"
                                                        style={{
                                                            height: `${h}%`,
                                                            backgroundColor: i === 13 ? '#D4A853' : '#D4A8534D',
                                                        }}
                                                        initial={{ scaleY: 0 }}
                                                        animate={{ scaleY: 1 }}
                                                        transition={{ duration: 0.5, delay: 1 + i * 0.04, ease: 'easeOut' }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Fade out bottom gradient so it looks like it bleeds off */}
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                                </div>
                            </div>
                            
                            {/* Floating notification card */}
                            <motion.div
                                className="absolute -bottom-6 -right-6 sm:-right-12 rounded-xl border border-[#1A1A2E]/8 bg-white p-4 shadow-2xl shadow-[#1A1A2E]/10 z-10"
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.6 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8BA888]/15">
                                        <svg className="h-6 w-6 text-[#8BA888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="pr-2 text-left">
                                        <div className="text-sm font-semibold text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Rent Payment Cleared
                                        </div>
                                        <div className="text-xs text-[#1A1A2E]/60 mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Apartment 4B — TZS 1,200,000
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
