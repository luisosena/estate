import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

import { TryDemoButton } from '@/components/try-demo-button';
import { Button } from '@/components/ui/button';

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
                        <h1
                            className="text-4xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-7xl"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Property management for{' '}
                            landlords and tenants.
                        </h1>

                        <p
                            className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#1A1A2E]/70"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Automate rent reconciliation, utility tracking, and maintenance SLAs on one secure platform.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <Button
                                asChild
                                size="lg"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-6 text-sm font-semibold tracking-wide text-[#FAF7F2] transition-all duration-300 hover:bg-[#2A2A4E] hover:-translate-y-0.5 dark:hover:bg-[#2A2A4E]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                <Link href="/register">
                                    Get Started
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
                            </Button>
                            <TryDemoButton
                                variant="outline"
                                size="lg"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1A1A2E]/20 px-8 py-6 text-sm font-semibold tracking-wide text-[#1A1A2E] transition-all duration-300 hover:bg-[#1A1A2E]/5 hover:-translate-y-0.5 dark:bg-transparent dark:border-[#1A1A2E]/20 dark:text-[#1A1A2E] dark:hover:bg-[#1A1A2E]/5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                label="Try Demo"
                            />
                            <Button
                                asChild
                                variant="ghost"
                                size="lg"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-6 text-sm font-semibold tracking-wide text-[#1A1A2E] transition-all duration-300 hover:bg-[#1A1A2E]/5"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                <Link href="#contact">
                                    Contact us
                                </Link>
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        className="mt-20 sm:mt-24 flex flex-wrap items-start justify-center gap-x-16 gap-y-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {[
                            { value: '120+', label: 'Hours saved / month' },
                            { value: '24/7', label: 'Automated support' },
                            { value: '99.9%', label: 'Uptime guarantee' },
                            { value: '5 min', label: 'Setup, no training' },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div
                                    className="text-3xl sm:text-4xl font-bold text-[#1A1A2E]"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {stat.value}
                                </div>
                                <div
                                    className="mt-2 text-sm text-[#1A1A2E]/50 font-medium"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>


                </div>
            </div>
        </section>
    );
}
