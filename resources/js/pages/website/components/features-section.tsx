import { Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    Building2,
    Receipt,
    Wrench,
    BarChart3,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';

const features = [
    {
        icon: Building2,
        title: 'Property Management',
        description:
            'Add properties, define units, and track occupancy across your entire portfolio. Get a real-time view of vacancies, active leases, and upcoming renewals from a single dashboard.',
    },
    {
        icon: Receipt,
        title: 'Rent & Billing',
        description:
            'Auto-generate invoices and reconcile M-Pesa, Airtel Money, and bank payments without manual entry. Late fees, partial payments, and arrears are tracked and surfaced automatically.',
    },
    {
        icon: Wrench,
        title: 'Maintenance & SLAs',
        description:
            'Tenants raise photo-attached work orders directly from their portal. Assign local vendors, monitor dispatch status, and log repair costs — all without leaving the platform.',
    },
    {
        icon: BarChart3,
        title: 'Financial Reporting',
        description:
            'Real-time ledger dashboards, EFD-compliant receipts, and income-vs-expense breakdowns per property. Understand your yield at the unit level, not just the portfolio level.',
    },
    {
        icon: ShieldCheck,
        title: 'Tenant Portal',
        description:
            'A self-service portal where tenants pay rent, purchase LUKU tokens, view official notices, and raise requests — reducing your daily operational overhead significantly.',
    },
    {
        icon: Zap,
        title: 'Utility Management',
        description:
            'Track water, electricity, and LUKU sub-meter tokens per unit. Auto-calculate utility charges each billing cycle and generate transparent receipts your tenants can trust.',
    },
];

export default function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section id="features" ref={ref} className="relative bg-background py-24 lg:py-32 overflow-hidden">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Left-aligned heading */}
                <motion.h2
                    className="mb-14 text-4xl md:text-6xl font-normal text-foreground leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    What Estate gives you
                </motion.h2>

                {/* 3-column feature grid — two rows */}
                <div className="grid grid-cols-1 gap-y-14 sm:grid-cols-3 sm:gap-x-12 lg:gap-x-16">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                className="flex flex-col"
                                initial={{ opacity: 0, y: 16 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.45, delay: 0.07 * i }}
                            >
                                {/* Icon — small outline, sits above title */}
                                <div className="mb-5">
                                <Icon
                                    className="h-7 w-7 text-muted-foreground"
                                    strokeWidth={1.25}
                                />
                                </div>

                                {/* Title */}
                                <h3 className="mb-2 text-xl md:text-2xl font-normal text-foreground leading-tight">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Get Started CTA */}
                <motion.div
                    className="mt-20 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Button
                        asChild
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold px-8 py-4 h-auto transition-all duration-200 shadow-sm"
                    >
                        <Link href="/register">
                            Get Started
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
