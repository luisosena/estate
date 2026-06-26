import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const steps = [
    {
        number: '01',
        title: 'Onboard',
        subtitle: 'Set up your portfolio in minutes',
        description:
            'Add your properties, create units, and invite tenants. Estate auto-generates tenant portals and sets up payment tracking from day one.',
        mockup: (
            <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/30" />
                    <div>
                        <div className="h-2.5 w-28 rounded bg-primary-foreground/30" />
                        <div className="mt-1.5 h-2 w-20 rounded bg-primary-foreground/15" />
                    </div>
                </div>
                <div className="space-y-2">
                    {['Sunrise Apartments', 'Maple Lane Complex', 'Downtown Lofts'].map((name, i) => (
                        <div key={name} className="flex items-center justify-between rounded-md bg-primary-foreground/5 px-3 py-2.5">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-primary/20" />
                                <span className="text-xs text-primary-foreground/70">{name}</span>
                            </div>
                            <span className="text-[10px] text-success">
                                {[12, 8, 6][i]} units
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        number: '02',
        title: 'Manage',
        subtitle: 'Day-to-day operations on autopilot',
        description:
            'Collect rent automatically, track maintenance requests, send notifications, and monitor utility consumption. All in real-time, all in one place.',
        mockup: (
            <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-4 h-2.5 w-24 rounded bg-primary-foreground/20" />
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { label: 'Collected', value: '$24,800', color: '#8BA888' },
                        { label: 'Pending', value: '$3,200', color: '#D4A853' },
                        { label: 'Occupancy', value: '94%', color: '#8BA888' },
                        { label: 'Requests', value: '3 open', color: '#C4775A' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-md bg-primary-foreground/5 p-3">
                            <div className="text-[10px] uppercase tracking-wider text-primary-foreground/40">{item.label}</div>
                            <div className="mt-1 font-display text-lg font-medium" style={{ color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        number: '03',
        title: 'Grow',
        subtitle: 'Scale with data-driven insights',
        description:
            'Analyze revenue trends, spot vacancies early, optimize rent pricing, and expand your portfolio with confidence. Estate grows with you.',
        mockup: (
            <div className="rounded-lg border border-primary-foreground/10 bg-primary-foreground/5 p-5 backdrop-blur-sm">
                <div className="mb-4 h-2.5 w-24 rounded bg-primary-foreground/20" />
                <div className="flex items-end gap-1.5 h-28">
                    {[30, 45, 35, 55, 50, 65, 60, 75, 70, 85, 80, 95].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-t transition-all duration-300"
                            style={{
                                height: `${h}%`,
                                backgroundColor: i >= 8 ? '#8BA888' : 'rgba(255,255,255,0.12)',
                            }}
                        />
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-primary-foreground/40">Jan</span>
                    <span className="text-[10px] text-primary-foreground/40">Dec</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-md bg-success/15 px-3 py-2">
                    <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                    <span className="text-xs text-success">+23% revenue growth</span>
                </div>
            </div>
        ),
    },
];

export default function WorkflowSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section id="how-it-works" ref={ref} className="relative bg-foreground py-24 lg:py-32 overflow-hidden">
            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                        How It Works
                    </p>
                    <h2 className="font-display text-3xl font-normal text-primary-foreground sm:text-4xl lg:text-5xl">
                        Three steps to seamless management
                    </h2>
                </motion.div>

                {/* Timeline + Content */}
                <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
                    {/* Left - Mockup */}
                    <motion.div
                        className="relative order-2 lg:order-1"
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        <div className="relative rounded-xl border border-primary-foreground/10 bg-primary-foreground/[0.03] p-6 backdrop-blur-sm">
                            {/* Browser dots */}
                            <div className="mb-4 flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground/20" />
                                <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground/20" />
                            </div>
                            {steps[activeStep].mockup}
                        </div>
                    </motion.div>

                    {/* Right - Timeline */}
                    <div className="relative order-1 lg:order-2">
                        <div className="space-y-0">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={step.number}
                                    className="relative cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                                    onClick={() => setActiveStep(i)}
                                >
                                    <div className="flex gap-6 py-6">
                                        {/* Timeline dot and line */}
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300"
                                                style={{
                                                    borderColor: activeStep === i ? '#D4A853' : 'rgba(255,255,255,0.15)',
                                                    backgroundColor: activeStep === i ? '#D4A853' : 'transparent',
                                                }}
                                            >
                                                <span
                                                    className="text-xs font-semibold transition-colors duration-300"
                                                    style={{
                                                        color: activeStep === i ? '#1A1A2E' : 'rgba(255,255,255,0.4)',
                                                    }}
                                                >
                                                    {step.number}
                                                </span>
                                            </div>
                                            {i < steps.length - 1 && (
                                                <div className="w-px flex-1 bg-white/10 mt-2" style={{ minHeight: '40px' }} />
                                            )}
                                        </div>

                                        {/* Step content */}
                                        <div className="pb-2">
                                            <h3
                                                className="font-display text-2xl font-normal transition-colors duration-300"
                                                style={{
                                                    color: activeStep === i ? '#D4A853' : 'rgba(255,255,255,0.7)',
                                                }}
                                            >
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm font-medium text-primary-foreground/50">
                                                {step.subtitle}
                                            </p>
                                            <motion.div
                                                initial={false}
                                                animate={{
                                                    height: activeStep === i ? 'auto' : 0,
                                                    opacity: activeStep === i ? 1 : 0,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/40">
                                                    {step.description}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
