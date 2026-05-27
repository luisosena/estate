import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SplitValuePropSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative bg-[#FAF7F2] py-24 lg:py-32 overflow-hidden">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#D4A853]/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#8BA888]/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Left-aligned elegant header */}
                <motion.div
                    className="text-left mb-16 lg:mb-20 max-w-4xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2
                        className="text-4xl md:text-6xl font-normal text-[#1A1A2E] leading-tight"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Build exceptional<br />property operations
                    </h2>
                </motion.div>

                {/* Main Content Split: 35% Left Column, 65% Right Column */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-12 lg:gap-16 items-stretch">
                    {/* Left Column: Anchor Intro Card */}
                    <motion.div
                        className="relative flex flex-col justify-between bg-[#F1EFEA] rounded-[24px] p-8 md:p-10 min-h-[520px] overflow-hidden border border-[#1A1A2E]/5"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="relative z-10">
                            <p
                                className="text-[#1A1A2E]/80 text-base leading-relaxed mb-8 font-normal"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Great property operations are more than just collection portals. They are high-fidelity experiences that show your brand in its best light, every time. They are repeatable, fast to scale, and deeply personal. They inform your financial operation and scale across your entire portfolio.
                            </p>
                            <Button
                                className="rounded-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FAF7F2] text-sm font-semibold px-6 py-3 h-auto w-fit transition-all duration-200"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Learn more
                            </Button>
                        </div>

                        {/* Bottom Graphic: Blue sleeve and gloved hand with magic wand */}
                        <div className="absolute bottom-0 left-0 w-full h-[220px] pointer-events-none select-none">
                            <svg viewBox="0 0 350 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Sparkles / Stars */}
                                <path d="M190 90 L193 98 L201 101 L193 104 L190 112 L187 104 L179 101 L187 98 Z" fill="#1A1A2E" opacity="0.3" />
                                <path d="M225 55 L227 61 L233 63 L227 65 L225 71 L223 65 L217 63 L223 61 Z" fill="#1A1A2E" opacity="0.4" />
                                <path d="M160 120 L161.5 124 L165.5 125.5 L161.5 127 L160 131 L158.5 127 L154.5 125.5 L158.5 124 Z" fill="#1A1A2E" opacity="0.3" />
                                
                                {/* Magic Wand */}
                                <rect x="180" y="100" width="6" height="55" rx="3" transform="rotate(-40 180 100)" fill="#1A1A2E" />
                                <rect x="180" y="90" width="6" height="10" rx="1.5" transform="rotate(-40 180 90)" fill="#E5E7EB" />
                                
                                {/* Arm & Hand */}
                                {/* Sleeve */}
                                <path d="M0 200 Q70 190 130 155 L110 115 Q50 150 0 160 Z" fill="#1E88E5" />
                                <path d="M110 115 Q120 135 130 155" stroke="white" strokeWidth="3" />
                                
                                {/* Glove cuff */}
                                <path d="M130 155 Q135 145 140 135 Q130 125 120 135 Q125 145 130 155 Z" fill="#90CAF9" />
                                
                                {/* Hand gripping wand */}
                                <path d="M142 130 Q148 132 155 128 Q158 123 152 120 Q145 122 142 130 Z" fill="#90CAF9" />
                                <path d="M155 123 Q162 122 165 116 Q162 110 155 112 Q150 115 155 123 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.5" />
                                <path d="M156 129 Q164 128 166 122 Q162 117 155 119 Q151 122 156 129 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.5" />
                                <path d="M153 135 Q161 134 163 128 Q159 123 152 125 Q148 128 153 135 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.5" />
                                <path d="M148 140 Q155 139 157 133 Q153 128 146 130 Q143 133 148 140 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.5" />
                            </svg>
                        </div>
                    </motion.div>

                    {/* Right Column: 2x2 Feature Benefit Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 lg:gap-x-16 lg:gap-y-16 py-4"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {/* Grid Item 1: Revenue Velocity */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Green illustrative icon */}
                            <div className="rounded-xl p-1 bg-white border border-[#1A1A2E]/5 shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="4" y="8" width="40" height="32" rx="4" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" />
                                    <line x1="4" y1="18" x2="44" y2="18" stroke="#2E7D32" strokeWidth="2" />
                                    <circle cx="9" cy="13" r="2" fill="#2E7D32" />
                                    <circle cx="15" cy="13" r="2" fill="#2E7D32" />
                                    <circle cx="21" cy="13" r="2" fill="#2E7D32" />
                                    <circle cx="34" cy="30" r="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                                    <path d="M31 30 L33 32 L37 28" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="text-xl md:text-2xl font-normal text-[#1A1A2E] mb-2 leading-tight"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    Accelerate Revenue Velocity
                                </h3>
                                <p
                                    className="text-sm leading-relaxed text-[#1A1A2E]/60 font-normal"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Accelerate the path from booking to active occupancy. Enable day-one move-in readiness, shorten vacant periods, and reduce your dependency on manual follow-ups.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 2: Consistency & Efficiency */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Blue illustrative icon */}
                            <div className="rounded-xl p-1 bg-white border border-[#1A1A2E]/5 shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
                                    <path d="M24 6 A18 18 0 0 1 42 24 L24 24 Z" fill="#90CAF9" stroke="#1565C0" strokeWidth="2" />
                                    <path d="M38 12 L30 18 M30 18 L34 18 M30 18 L30 14" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="text-xl md:text-2xl font-normal text-[#1A1A2E] mb-2 leading-tight"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    Create Consistency & Efficiency
                                </h3>
                                <p
                                    className="text-sm leading-relaxed text-[#1A1A2E]/60 font-normal"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Slash infrastructure cost and create a flexible and scalable property operations layer, that's risk-free, and independent of fragmented legacy tools.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 3: Scale Property Expertise */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Pink illustrative icon */}
                            <div className="rounded-xl p-1 bg-white border border-[#1A1A2E]/5 shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 10 H40 V34 H20 L10 40 V34 H8 Z" fill="#FCE4EC" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round" />
                                    <path d="M19 16 L29 22 L19 28 Z" fill="#F48FB1" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="text-xl md:text-2xl font-normal text-[#1A1A2E] mb-2 leading-tight"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    Scale Property Expertise
                                </h3>
                                <p
                                    className="text-sm leading-relaxed text-[#1A1A2E]/60 font-normal"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Give front-line teams the independence to showcase real units with the standards and consistency of an expert playbook so anyone can manage complex tenancies with confidence.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 4: Reveal Portfolio Intelligence */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Gold/yellow illustrative icon */}
                            <div className="rounded-xl p-1 bg-white border border-[#1A1A2E]/5 shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="8" y="6" width="32" height="36" rx="4" fill="#FFFDE7" stroke="#F57F17" strokeWidth="2" />
                                    <line x1="14" y1="12" x2="24" y2="12" stroke="#F57F17" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="14" y1="18" x2="34" y2="18" stroke="#F57F17" strokeWidth="2" strokeLinecap="round" />
                                    <rect x="14" y="26" width="4" height="10" fill="#FFE082" stroke="#F57F17" strokeWidth="2" />
                                    <rect x="22" y="22" width="4" height="14" fill="#FFE082" stroke="#F57F17" strokeWidth="2" />
                                    <rect x="30" y="28" width="4" height="8" fill="#FFE082" stroke="#F57F17" strokeWidth="2" />
                                </svg>
                            </div>
                            <div>
                                <h3
                                    className="text-xl md:text-2xl font-normal text-[#1A1A2E] mb-2 leading-tight"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    Reveal Portfolio Intelligence
                                </h3>
                                <p
                                    className="text-sm leading-relaxed text-[#1A1A2E]/60 font-normal"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Transform the "dark ledger" into actionable insights. Correlate granular rent payments, late-fee patterns, and utility consumption directly to overall yield.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
