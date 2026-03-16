import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-32">
            {/* Background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-[#F5E6D3] via-[#FAF7F2] to-[#FAF7F2]" />
                {/* Decorative geometric shapes */}
                <div className="absolute top-20 right-[10%] h-72 w-72 rounded-full bg-[#D4A853]/8 blur-3xl" />
                <div className="absolute bottom-10 left-[5%] h-56 w-56 rounded-full bg-[#C4775A]/6 blur-3xl" />
                {/* Architectural line art - subtle grid */}
                <svg
                    className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03]"
                    viewBox="0 0 600 800"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <line x1="100" y1="0" x2="100" y2="800" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="800" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="300" y1="0" x2="300" y2="800" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="400" y1="0" x2="400" y2="800" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="0" y1="200" x2="600" y2="200" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="0" y1="400" x2="600" y2="400" stroke="#1A1A2E" strokeWidth="1" />
                    <line x1="0" y1="600" x2="600" y2="600" stroke="#1A1A2E" strokeWidth="1" />
                    {/* Building silhouette */}
                    <rect x="150" y="300" width="100" height="300" stroke="#1A1A2E" strokeWidth="1" fill="none" />
                    <rect x="280" y="200" width="80" height="400" stroke="#1A1A2E" strokeWidth="1" fill="none" />
                    <rect x="390" y="350" width="120" height="250" stroke="#1A1A2E" strokeWidth="1" fill="none" />
                    {/* Windows */}
                    <rect x="170" y="340" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                    <rect x="210" y="340" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                    <rect x="170" y="400" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                    <rect x="210" y="400" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                    <rect x="170" y="460" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                    <rect x="210" y="460" width="20" height="25" stroke="#1A1A2E" strokeWidth="0.5" fill="none" />
                </svg>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left - Copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 px-4 py-1.5"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853]" />
                            <span
                                className="text-xs font-medium tracking-wider uppercase text-[#D4A853]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Property Management, Reimagined
                            </span>
                        </motion.div>

                        <h1
                            className="text-4xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-5xl lg:text-6xl"
                            style={{ fontFamily: "'DM Serif Display', serif" }}
                        >
                            Manage properties{' '}
                            <span className="relative">
                                with clarity
                                <svg
                                    className="absolute -bottom-2 left-0 w-full"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
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
                            and confidence.
                        </h1>

                        <p
                            className="mt-6 max-w-lg text-lg leading-relaxed text-[#1A1A2E]/60"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            The all-in-one platform for landlords and tenants. Track properties,
                            manage payments, handle maintenance — all in one beautiful dashboard.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                href="/register"
                                className="group relative inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-3.5 text-sm font-medium tracking-wide text-[#FAF7F2] transition-all duration-300 hover:bg-[#2A2A4E] hover:shadow-xl hover:shadow-[#1A1A2E]/15"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Start For Free
                                <svg
                                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <a
                                href="#how-it-works"
                                className="group inline-flex items-center gap-2 rounded-full border border-[#1A1A2E]/15 px-8 py-3.5 text-sm font-medium tracking-wide text-[#1A1A2E] transition-all duration-300 hover:border-[#1A1A2E]/30 hover:bg-[#1A1A2E]/5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                <svg className="h-4 w-4 text-[#C4775A]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                See How It Works
                            </a>
                        </div>
                    </motion.div>

                    {/* Right - Dashboard Mockup */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="relative">
                            {/* Browser chrome */}
                            <div className="overflow-hidden rounded-xl border border-[#1A1A2E]/10 bg-white shadow-2xl shadow-[#1A1A2E]/10">
                                {/* Title bar */}
                                <div className="flex items-center gap-2 border-b border-[#1A1A2E]/5 bg-[#FAFAFA] px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                                        <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                                        <div className="h-3 w-3 rounded-full bg-[#28C840]" />
                                    </div>
                                    <div className="mx-auto flex-1">
                                        <div className="mx-auto max-w-xs rounded-md bg-[#F0F0F0] px-4 py-1.5 text-center text-xs text-[#1A1A2E]/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            app.estate.com/dashboard
                                        </div>
                                    </div>
                                </div>
                                {/* Mock dashboard content */}
                                <div className="bg-white p-6">
                                    {/* Header row */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div>
                                            <div className="h-3 w-32 rounded bg-[#1A1A2E]/10" />
                                            <div className="mt-2 h-2 w-20 rounded bg-[#1A1A2E]/5" />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 rounded-full bg-[#D4A853]/20" />
                                            <div className="h-8 w-8 rounded-full bg-[#8BA888]/20" />
                                        </div>
                                    </div>
                                    {/* Stat cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[
                                            { label: 'Properties', value: '24', color: '#D4A853' },
                                            { label: 'Units', value: '128', color: '#8BA888' },
                                            { label: 'Revenue', value: '$48.2K', color: '#C4775A' },
                                        ].map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-lg border border-[#1A1A2E]/5 p-3"
                                            >
                                                <div
                                                    className="text-[10px] font-medium uppercase tracking-wider text-[#1A1A2E]/40"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    {stat.label}
                                                </div>
                                                <div
                                                    className="mt-1 text-xl font-semibold"
                                                    style={{ color: stat.color, fontFamily: "'DM Serif Display', serif" }}
                                                >
                                                    {stat.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Chart placeholder */}
                                    <div className="rounded-lg border border-[#1A1A2E]/5 p-4">
                                        <div className="mb-3 h-2 w-24 rounded bg-[#1A1A2E]/10" />
                                        <div className="flex items-end gap-2 h-24">
                                            {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="flex-1 rounded-t"
                                                    style={{
                                                        height: `${h}%`,
                                                        backgroundColor: i === 11 ? '#D4A853' : '#D4A8534D',
                                                    }}
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{
                                                        duration: 0.5,
                                                        delay: 0.8 + i * 0.05,
                                                        ease: 'easeOut',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification card */}
                            <motion.div
                                className="absolute -bottom-6 -left-8 rounded-lg border border-[#1A1A2E]/8 bg-white p-4 shadow-xl shadow-[#1A1A2E]/8"
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8BA888]/15">
                                        <svg className="h-5 w-5 text-[#8BA888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-[#1A1A2E]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Payment Received
                                        </div>
                                        <div className="text-xs text-[#1A1A2E]/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            Unit 4B — $1,200.00
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
