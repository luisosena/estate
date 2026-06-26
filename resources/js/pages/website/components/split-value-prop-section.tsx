import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function SplitValuePropSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="relative bg-background py-24 lg:py-32 overflow-hidden">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Left-aligned elegant header */}
                <motion.div
                    className="text-left mb-16 lg:mb-20 max-w-4xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-normal text-foreground leading-tight">
                        Build exceptional<br />property operations
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
                                Great property operations are more than just collection portals. They are high-fidelity experiences that show your brand in its best light, every time. They are repeatable, fast to scale, and deeply personal. They inform your financial operation and scale across your entire portfolio.
                            </p>
                            <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-6 py-3 h-auto w-fit transition-all duration-200">
                                Learn more
                            </Button>
                        </div>

                        {/* Bottom Graphic: Isometric Glassmorphic Portfolio Layers */}
                        <div className="absolute bottom-0 left-0 w-full h-[220px] pointer-events-none select-none">
                            <svg viewBox="0 0 350 220" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="splitPremiumGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8BA888" stopOpacity="0.15" />
                                        <stop offset="50%" stopColor="#D4A853" stopOpacity="0.05" />
                                        <stop offset="100%" stopColor="#C4775A" stopOpacity="0.15" />
                                    </linearGradient>
                                    <linearGradient id="isoCardBg" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.75" />
                                    </linearGradient>
                                    <filter id="isoShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
                                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1A1A2E" floodOpacity="0.08" />
                                    </filter>
                                </defs>

                                {/* Ambient Glow Background */}
                                <circle cx="175" cy="110" r="90" fill="url(#splitPremiumGlow)" filter="blur(25px)" />

                                {/* Sparkles / Stars */}
                                <path d="M280 60 L282 66 L288 68 L282 70 L280 76 L278 70 L272 68 L278 66 Z" fill="#D4A853" opacity="0.6" />
                                <path d="M70 140 L71.5 144 L75.5 145.5 L71.5 147 L70 151 L68.5 147 L64.5 145.5 L68.5 144 Z" fill="#8BA888" opacity="0.6" />

                                {/* ISOMETRIC GROUP */}
                                <g transform="translate(10, 0)">
                                    {/* LAYER 1: BOTTOM (Ledger & Revenue - Sage Green themes) */}
                                    <g filter="url(#isoShadow)">
                                        {/* Isometric Plane Path */}
                                        <path d="M165 140 L265 95 L165 50 L65 95 Z" fill="url(#isoCardBg)" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.08" />
                                        
                                        {/* Chart Grid Lines on Plane */}
                                        <path d="M95 81.5 L195 126.5 M125 68 L225 113 M145 104 L205 77 M115 90.5 L175 63.5" stroke="#1A1A2E" strokeWidth="0.5" strokeOpacity="0.04" />
                                        
                                        {/* Revenue Line */}
                                        <path d="M95 85 L125 78 L155 92 L185 80 L215 94 L235 85" stroke="#8BA888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="185" cy="80" r="2.5" fill="#8BA888" />
                                        <circle cx="235" cy="85" r="2.5" fill="#8BA888" />
                                    </g>

                                    {/* Vertical Connectors between layers */}
                                    <line x1="165" y1="95" x2="165" y2="60" stroke="#1A1A2E" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                                    <line x1="105" y1="122" x2="105" y2="87" stroke="#1A1A2E" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />
                                    <line x1="225" y1="68" x2="225" y2="33" stroke="#1A1A2E" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />

                                    {/* LAYER 2: MIDDLE (Operations & Occupancy - Terracotta themes) */}
                                    <g filter="url(#isoShadow)" transform="translate(0, -35)">
                                        <path d="M165 140 L265 95 L165 50 L65 95 Z" fill="url(#isoCardBg)" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.08" />
                                        
                                        {/* Grid Points */}
                                        <circle cx="115" cy="85" r="3" fill="#C4775A" fillOpacity="0.7" />
                                        <circle cx="145" cy="75" r="3" fill="#1A1A2E" fillOpacity="0.15" />
                                        <circle cx="175" cy="95" r="3" fill="#C4775A" fillOpacity="0.7" />
                                        <circle cx="205" cy="85" r="3" fill="#1A1A2E" fillOpacity="0.15" />
                                        <circle cx="145" cy="105" r="3" fill="#C4775A" fillOpacity="0.7" />
                                        
                                        {/* Connector Webs */}
                                        <path d="M115 85 L145 75 L175 95 L145 105 Z" stroke="#C4775A" strokeWidth="1" strokeOpacity="0.3" />
                                        <line x1="175" y1="95" x2="205" y2="85" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.1" />
                                    </g>

                                    {/* LAYER 3: TOP (Blueprint Structure - Gold & Architecture) */}
                                    <g filter="url(#isoShadow)" transform="translate(0, -70)">
                                        <path d="M165 140 L265 95 L165 50 L65 95 Z" fill="url(#isoCardBg)" stroke="#1A1A2E" strokeWidth="1" strokeOpacity="0.08" />
                                        
                                        {/* Isometric Building Wireframe structure */}
                                        {/* Base */}
                                        <path d="M135 95 L165 108.5 L195 95 L165 81.5 Z" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" />
                                        {/* Columns */}
                                        <line x1="135" y1="95" x2="135" y2="75" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" />
                                        <line x1="165" y1="108.5" x2="165" y2="88.5" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" />
                                        <line x1="195" y1="95" x2="195" y2="75" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" />
                                        <line x1="165" y1="81.5" x2="165" y2="61.5" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" />
                                        {/* Roof */}
                                        <path d="M135 75 L165 88.5 L195 75 L165 61.5 Z" stroke="#D4A853" strokeWidth="1.5" strokeOpacity="0.8" fill="#D4A853" fillOpacity="0.1" />
                                    </g>
                                </g>
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
                            <div className="rounded-xl p-1 bg-card border border-border shadow-sm">
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
                                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-2 leading-tight">
                                    Accelerate Revenue Velocity
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                                    Accelerate the path from booking to active occupancy. Enable day-one move-in readiness, shorten vacant periods, and reduce your dependency on manual follow-ups.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 2: Consistency & Efficiency */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Blue illustrative icon */}
                            <div className="rounded-xl p-1 bg-card border border-border shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="24" cy="24" r="18" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />
                                    <path d="M24 6 A18 18 0 0 1 42 24 L24 24 Z" fill="#90CAF9" stroke="#1565C0" strokeWidth="2" />
                                    <path d="M38 12 L30 18 M30 18 L34 18 M30 18 L30 14" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-2 leading-tight">
                                    Create Consistency & Efficiency
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                                    Slash infrastructure cost and create a flexible and scalable property operations layer, that's risk-free, and independent of fragmented legacy tools.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 3: Scale Property Expertise */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Pink illustrative icon */}
                            <div className="rounded-xl p-1 bg-card border border-border shadow-sm">
                                <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 10 H40 V34 H20 L10 40 V34 H8 Z" fill="#FCE4EC" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round" />
                                    <path d="M19 16 L29 22 L19 28 Z" fill="#F48FB1" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-2 leading-tight">
                                    Scale Property Expertise
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                                    Give front-line teams the independence to showcase real units with the standards and consistency of an expert playbook so anyone can manage complex tenancies with confidence.
                                </p>
                            </div>
                        </div>

                        {/* Grid Item 4: Reveal Portfolio Intelligence */}
                        <div className="flex flex-col items-start gap-4">
                            {/* Gold/yellow illustrative icon */}
                            <div className="rounded-xl p-1 bg-card border border-border shadow-sm">
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
                                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-2 leading-tight">
                                    Reveal Portfolio Intelligence
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground font-normal">
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
