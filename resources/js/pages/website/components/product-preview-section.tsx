import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

import { cn } from '@/lib/utils';

interface FeatureProps {
    eyebrow: string;
    headline: string;
    description: string;
    points: string[];
    isReversed?: boolean;
    bgColor: string;
    mockup: React.ReactNode;
}

function FeatureRow({ eyebrow, headline, description, points, isReversed, bgColor, mockup }: FeatureProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <div ref={ref} className={cn("py-24 border-b border-border last:border-0", bgColor)}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className={cn("flex flex-col gap-16 lg:items-center", isReversed ? "lg:flex-row-reverse" : "lg:flex-row")}>
                    {/* Text side */}
                    <motion.div 
                        className="flex-1 lg:max-w-lg"
                        initial={{ opacity: 0, x: isReversed ? 40 : -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <span className="text-xs font-bold tracking-widest text-primary uppercase">
                            {eyebrow}
                        </span>
                        <h3 className="font-display mt-4 text-3xl font-normal text-foreground sm:text-4xl leading-tight">
                            {headline}
                        </h3>
                        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                        
                        <ul className="mt-8 space-y-4">
                            {points.map((point, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
                                        <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-foreground/80 font-medium">
                                        {point}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Visual side */}
                    <motion.div 
                        className="flex-1 w-full"
                        initial={{ opacity: 0, x: isReversed ? -40 : 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    >
                        <div className="relative mx-auto max-w-[600px]">
                            {/* Browser Chrome */}
                            <div className="overflow-hidden rounded-xl border border-border bg-card">
                                {/* Title bar */}
                                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
                                    <div className="flex gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                                    </div>
                                </div>
                                {/* Mockup content */}
                                <div className="bg-background/30 p-6 h-[380px] overflow-hidden">
                                    {mockup}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function ProductPreviewSection() {
    return (
        <section className="relative overflow-hidden">
            <FeatureRow 
                eyebrow="Portfolio Overview"
                headline="Everything about your portfolio — at a glance."
                description="Stop digging through spreadsheets. See real-time metrics, occupancy rates, and financial health for every property you own from one unified dashboard."
                points={[
                    "Aggregated performance metrics across all units",
                    "Occupancy tracking with historical data",
                    "One-click drill down into specific properties"
                ]}
                isReversed={false}
                bgColor="bg-background"
                mockup={
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="h-4 w-32 rounded bg-foreground/10" />
                            <div className="flex gap-2">
                                <div className="h-6 w-20 rounded border border-border" />
                                <div className="h-6 w-20 rounded bg-primary text-primary-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="h-2 w-16 rounded bg-foreground/10 mb-3" />
                                <div className="h-6 w-24 rounded bg-primary/20" />
                            </div>
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="h-2 w-16 rounded bg-foreground/10 mb-3" />
                                <div className="h-6 w-16 rounded bg-success/20" />
                            </div>
                        </div>
                        <div className="flex-1 rounded-lg border border-border bg-card p-4">
                            <div className="h-3 w-24 rounded bg-foreground/10 mb-4" />
                            <div className="flex flex-col gap-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between border-b border-border pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-foreground/5" />
                                            <div>
                                                <div className="h-2.5 w-32 rounded bg-foreground/20 mb-1.5" />
                                                <div className="h-2 w-20 rounded bg-foreground/10" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-12 rounded-full bg-success/15" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
            />

            <FeatureRow 
                eyebrow="Payment Collection"
                headline="Rent collected. Receipts sent. Automatically."
                description="Make it easy for tenants to pay on time. Estate handles invoicing, payment processing, late fees, and auto-generates compliant receipts without you lifting a finger."
                points={[
                    "Mobile Money and bank transfer integrations",
                    "Automated PDF receipt generation",
                    "Customizable late fee schedules"
                ]}
                isReversed={true}
                bgColor="bg-background"
                mockup={
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg border border-border bg-card p-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg className="h-16 w-16 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.65 0 1.12-.97 1.93-2.73 1.93-1.97 0-2.81-1-2.92-2.3H7.3c.12 2.17 1.55 3.51 3.5 3.93V21h3v-2.1c1.94-.46 3.5-1.76 3.5-3.83 0-2.61-2-3.5-5.5-4.17z"/></svg>
                            </div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
                                    <div className="h-5 w-5 rounded-full bg-success" />
                                </div>
                                <div>
                                    <div className="h-3 w-24 rounded bg-foreground/20 mb-1" />
                                    <div className="h-2 w-16 rounded bg-success/40" />
                                </div>
                            </div>
                            <div className="h-8 w-40 rounded bg-foreground/5 mb-6" />
                            <div className="flex justify-between items-center border-t border-border pt-4">
                                <div className="h-3 w-20 rounded bg-foreground/10" />
                                <div className="h-6 w-24 rounded bg-primary/10" />
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="flex-1 rounded-lg border border-border bg-card p-4">
                                <div className="h-2 w-16 rounded bg-foreground/10 mb-2" />
                                <div className="h-4 w-full rounded bg-foreground/5" />
                            </div>
                            <div className="flex-1 rounded-lg border border-border bg-card p-4 border-l-4 border-l-chart-3">
                                <div className="h-2 w-16 rounded bg-foreground/10 mb-2" />
                                <div className="h-4 w-full rounded bg-chart-3/20" />
                            </div>
                        </div>
                    </div>
                }
            />

            <FeatureRow 
                eyebrow="Maintenance Tracking"
                headline="From report to resolve — fully tracked."
                description="Empower tenants to report issues with photos directly from their portal. Assign tasks to vendors, track repair progress, and log expenses to the specific property automatically."
                points={[
                    "Tenant photo uploads for clear issue reporting",
                    "Vendor assignment and status tracking",
                    "Automated maintenance expense logging"
                ]}
                isReversed={false}
                bgColor="bg-background"
                mockup={
                    <div className="flex flex-col gap-3 h-full">
                        <div className="flex gap-2 border-b border-border pb-2">
                            <div className="px-3 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground">Open (3)</div>
                            <div className="px-3 py-1 text-[10px] font-bold rounded bg-transparent text-foreground/40">In Progress (1)</div>
                            <div className="px-3 py-1 text-[10px] font-bold rounded bg-transparent text-foreground/40">Resolved</div>
                        </div>
                        
                        {[
                            { title: 'Leaking Faucet', unit: 'Unit 4B', priority: 'High', color: '#C4775A' },
                            { title: 'AC Filter Replacement', unit: 'Unit 2A', priority: 'Low', color: '#8BA888' },
                            { title: 'Broken Light Fixture', unit: 'Unit 1C', priority: 'Medium', color: '#D4A853' }
                        ].map((issue, i) => (
                            <div key={i} className="rounded border border-border bg-card p-3 flex gap-3">
                                <div className="h-12 w-12 rounded bg-foreground/5 shrink-0 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-[11px] font-bold text-foreground">{issue.title}</div>
                                        <div className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${issue.color}20`, color: issue.color }}>{issue.priority}</div>
                                    </div>
                                    <div className="text-[9px] text-muted-foreground mb-2">{issue.unit} • Reported 2h ago</div>
                                    <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full w-1/4" style={{ backgroundColor: issue.color }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            />
        </section>
    );
}
