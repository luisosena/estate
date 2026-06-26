import { Head, Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import {
    Building2,
    Receipt,
    Wrench,
    BarChart3,
    ShieldCheck,
    Zap,
    ArrowRight,
    CheckCircle2,
} from 'lucide-react';
import { useRef } from 'react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import Navbar from '@/pages/website/components/navbar';
import Footer from '@/pages/website/components/footer';
import CtaSection from '@/pages/website/components/cta-section';

const featureDetails = [
    {
        id: 'property-management',
        icon: Building2,
        title: 'Property Management',
        tagline: 'Your entire portfolio, one pane of glass.',
        description:
            'Add properties, define units, and track occupancy across your entire portfolio. Get a real-time view of vacancies, active leases, and upcoming renewals from a single dashboard.',
        benefits: [
            'Unlimited property and unit creation',
            'Visual occupancy heatmaps per building',
            'Automated lease renewal reminders',
            'Drag-and-drop unit reconfiguration',
            'Bulk import from spreadsheets',
        ],
        capabilities: [
            { label: 'Portfolio Overview', desc: 'See every property at a glance with KPIs for occupancy, revenue, and maintenance.' },
            { label: 'Lease Management', desc: 'Store digital lease agreements with auto-expiry alerts and renewal workflows.' },
            { label: 'Unit Tracking', desc: 'Track unit status — occupied, vacant, under maintenance — in real time.' },
        ],
    },
    {
        id: 'rent-billing',
        icon: Receipt,
        title: 'Rent & Billing',
        tagline: 'Automated rent reconciliation, zero manual entry.',
        description:
            'Auto-generate invoices and reconcile M-Pesa, Airtel Money, and bank payments without manual entry. Late fees, partial payments, and arrears are tracked and surfaced automatically.',
        benefits: [
            'Auto-reconciliation with mobile money & bank transfers',
            'Pro-rated rent calculations for mid-month move-ins',
            'Automated late fee application',
            'Digital receipts with EFD-compliant numbering',
            'Arrears tracking with tenant notifications',
        ],
        capabilities: [
            { label: 'Payment Reconciliation', desc: 'Auto-match incoming payments to invoices using transaction reference numbers.' },
            { label: 'Invoice Automation', desc: 'Generate and distribute invoices on a custom schedule — monthly, weekly, or quarterly.' },
            { label: 'Arrears Management', desc: 'Overdue payments trigger automated reminders and escalation workflows.' },
        ],
    },
    {
        id: 'maintenance',
        icon: Wrench,
        title: 'Maintenance & SLAs',
        tagline: 'From report to resolved, faster than ever.',
        description:
            'Tenants raise photo-attached work orders directly from their portal. Assign local vendors, monitor dispatch status, and log repair costs — all without leaving the platform.',
        benefits: [
            'Photo-attached work order submissions',
            'Vendor assignment and dispatch tracking',
            'SLA enforcement with auto-escalation',
            'Repair cost logging per unit',
            'Tenant satisfaction ratings on completed work',
        ],
        capabilities: [
            { label: 'Work Order Management', desc: 'Tenants submit requests with photos; landlords assign and track progress in real time.' },
            { label: 'Vendor Network', desc: 'Maintain a preferred vendor list with performance ratings and cost history.' },
            { label: 'SLA Monitoring', desc: 'Set response and resolution SLAs with automatic escalation on breach.' },
        ],
    },
    {
        id: 'financial-reporting',
        icon: BarChart3,
        title: 'Financial Reporting',
        tagline: 'Know your numbers, down to the last cent.',
        description:
            'Real-time ledger dashboards, EFD-compliant receipts, and income-vs-expense breakdowns per property. Understand your yield at the unit level, not just the portfolio level.',
        benefits: [
            'Per-unit profitability analysis',
            'Income vs expense breakdowns',
            'EFD-compliant receipt generation',
            'Export reports to PDF or CSV',
            'Audit-ready ledger trails',
        ],
        capabilities: [
            { label: 'Dashboard Analytics', desc: 'Real-time visual dashboards with revenue, occupancy, and expense trends.' },
            { label: 'Tax Compliance', desc: 'Generate EFD-compliant receipts and reports for regulatory audits.' },
            { label: 'Export & Share', desc: 'Export financial reports in PDF or CSV format for accountants and stakeholders.' },
        ],
    },
    {
        id: 'tenant-portal',
        icon: ShieldCheck,
        title: 'Tenant Portal',
        tagline: 'Self-service that reduces your daily overhead.',
        description:
            'A self-service portal where tenants pay rent, purchase LUKU tokens, view official notices, and raise requests — reducing your daily operational overhead significantly.',
        benefits: [
            'Pay rent via M-Pesa, Airtel Money, or card',
            'Purchase LUKU tokens directly',
            'View payment history and receipts',
            'Submit and track maintenance requests',
            'Receive push notifications for bills and notices',
        ],
        capabilities: [
            { label: 'Payments', desc: 'Tenants pay rent and view outstanding balances through an intuitive dashboard.' },
            { label: 'Utility Purchases', desc: 'Buy LUKU electricity tokens and track water usage from the portal.' },
            { label: 'Communication', desc: 'Receive official notices, bill reminders, and maintenance updates in real time.' },
        ],
    },
    {
        id: 'utility-management',
        icon: Zap,
        title: 'Utility Management',
        tagline: 'No more spreadsheet chaos for utilities.',
        description:
            'Track water, electricity, and LUKU sub-meter tokens per unit. Auto-calculate utility charges each billing cycle and generate transparent receipts your tenants can trust.',
        benefits: [
            'LUKU token tracking per unit',
            'Water and electricity sub-meter management',
            'Auto-calculation of utility charges',
            'Transparent usage receipts for tenants',
            'Utility arrears monitoring',
        ],
        capabilities: [
            { label: 'Meter Tracking', desc: 'Log sub-meter readings and LUKU token purchases per unit automatically.' },
            { label: 'Billing Integration', desc: 'Utility charges are calculated and added to the monthly rent invoice.' },
            { label: 'Usage Insights', desc: 'View consumption trends and identify anomalies across your portfolio.' },
        ],
    },
];

function FeatureHero() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section
            ref={ref}
            className="relative min-h-[70vh] flex items-center bg-background pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-success/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                        All features,{' '}
                        <span className="text-primary">no friction</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
                        Estate brings together property management, financials, maintenance, and tenant
                        communication into one seamless platform — built for African real estate.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-sm"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <a
                            href="#property-management"
                            className="inline-flex items-center gap-2 rounded-full border border-input px-8 py-4 text-base font-semibold text-foreground transition-all duration-200 hover:bg-muted"
                        >
                            Explore features
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function DetailedFeature({
    feature,
    index,
}: {
    feature: (typeof featureDetails)[0];
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const isEven = index % 2 === 0;
    const Icon = feature.icon;

    return (
        <section
            id={feature.id}
            ref={ref}
            className={`relative py-24 lg:py-32 ${isEven ? 'bg-muted/30' : 'bg-card'}`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 lg:gap-24 items-start`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                                <Icon className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <span className="text-sm font-semibold tracking-[0.15em] uppercase text-primary">
                                Feature
                            </span>
                        </div>

                        <h2 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-3">
                            {feature.title}
                        </h2>
                        <p className="text-lg md:text-xl text-primary font-medium mb-6">
                            {feature.tagline}
                        </p>
                        <p className="text-base leading-relaxed text-muted-foreground mb-10 max-w-xl">
                            {feature.description}
                        </p>

                        <div className="space-y-3 mb-10">
                            {feature.benefits.map((benefit) => (
                                <div key={benefit} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                                    <span className="text-sm text-muted-foreground">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {feature.capabilities.map((cap) => (
                                <div
                                    key={cap.label}
                                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                                >
                                    <h3 className="text-base font-semibold text-foreground mb-2">
                                        {cap.label}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {cap.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function FeatureNav() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });

    return (
        <section ref={ref} className="bg-card border-b border-border sticky top-0 z-30">
            <motion.div
                className="mx-auto max-w-7xl px-6 lg:px-8"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center overflow-x-auto gap-1 py-3 scrollbar-none">
                    {featureDetails.map((f) => (
                        <a
                            key={f.id}
                            href={`#${f.id}`}
                            className="shrink-0 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
                        >
                            {f.title}
                        </a>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}

export default function Features() {
    return (
        <MarketingLayout>
            <Head title="Features — Estate">
                <meta
                    name="description"
                    content="Explore all Estate features — property management, rent & billing, maintenance, financial reporting, tenant portal, and utility management."
                />
            </Head>

            <Navbar />
            <FeatureHero />
            <FeatureNav />
            {featureDetails.map((feature, index) => (
                <DetailedFeature key={feature.id} feature={feature} index={index} />
            ))}
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
