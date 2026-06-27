import { Head, Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, ArrowRight, CheckCircle2, Building2, Receipt, Wrench, BarChart3 } from 'lucide-react';
import { useRef } from 'react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import CtaSection from '@/pages/website/components/cta-section';
import Footer from '@/pages/website/components/footer';
import Navbar from '@/pages/website/components/navbar';

const features = [
    {
        icon: Building2,
        title: 'Property Management',
        description: 'View all your properties, units, and occupancy status at a glance.',
    },
    {
        icon: Receipt,
        title: 'Rent Collection',
        description: 'Track payments, send reminders, and manage M-Pesa transactions on the go.',
    },
    {
        icon: Wrench,
        title: 'Maintenance Tracking',
        description: 'Submit and track work orders with real-time status updates.',
    },
    {
        icon: BarChart3,
        title: 'Financial Reports',
        description: 'Access your income, expenses, and EFD-compliant reports anytime.',
    },
];

const screenshots = [
    {
        title: 'Dashboard',
        description: 'Your complete portfolio at a glance',
    },
    {
        title: 'Payments',
        description: 'Track rent and utility payments',
    },
    {
        title: 'Maintenance',
        description: 'Manage work orders and tickets',
    },
];

function MobileAppHero() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section
            ref={ref}
            className="relative min-h-[70vh] flex items-center bg-[#FAF7F2] pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-[#D4A853]/8 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-[#8BA888]/8 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text content */}
                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E]/5 px-4 py-2 mb-6">
                            <Smartphone className="h-4 w-4 text-[#D4A853]" />
                            <span
                                className="text-sm font-medium text-[#1A1A2E]/70"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Mobile App
                            </span>
                        </div>
                        <h1
                            className="text-4xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-5xl lg:text-6xl"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Manage your properties{' '}
                            <span className="text-[#D4A853]">anywhere</span>
                        </h1>
                        <p
                            className="mt-6 max-w-xl text-lg text-[#1A1A2E]/60 leading-relaxed"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Take Estate with you on iOS and Android. Track rent, manage maintenance, and monitor your portfolio from anywhere.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link
                                href="#download"
                                className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-4 text-base font-semibold text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Download App
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Phone mockup */}
                    <motion.div
                        className="flex-1 flex justify-center"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="relative w-[280px]">
                            {/* Phone frame */}
                            <div className="rounded-[40px] border-[6px] border-[#1A1A2E] bg-[#FAF7F2] overflow-hidden shadow-2xl">
                                {/* Notch */}
                                <div className="h-7 bg-[#1A1A2E] flex justify-center items-center">
                                    <div className="w-20 h-3 rounded-full bg-black/50" />
                                </div>

                                <div className="p-5 flex flex-col gap-4">
                                    {/* Header */}
                                    <div className="text-center">
                                        <div
                                            className="text-[9px] text-[#1A1A2E]/40 font-bold uppercase tracking-wider"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Estate
                                        </div>
                                        <div
                                            className="text-sm font-bold text-[#1A1A2E]"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Dashboard
                                        </div>
                                    </div>

                                    {/* KPI cards */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-[#1A1A2E]/10 bg-white p-3">
                                            <div
                                                className="text-[7px] font-bold uppercase tracking-widest text-[#1A1A2E]/30"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                Occupancy
                                            </div>
                                            <div
                                                className="text-lg font-bold text-[#8BA888] mt-1"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                98%
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-[#1A1A2E]/10 bg-white p-3">
                                            <div
                                                className="text-[7px] font-bold uppercase tracking-widest text-[#1A1A2E]/30"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                Collected
                                            </div>
                                            <div
                                                className="text-lg font-bold text-[#D4A853] mt-1"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                TZS 4.2M
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent payments */}
                                    <div className="rounded-lg border border-[#1A1A2E]/10 bg-white p-3">
                                        <div
                                            className="text-[8px] font-bold uppercase tracking-wide text-[#1A1A2E]/40 mb-2"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Recent Payments
                                        </div>
                                        <div className="space-y-2">
                                            {['Apt 302', 'Unit 12', 'Suite 5'].map((unit, i) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <span
                                                        className="text-[9px] font-medium text-[#1A1A2E]"
                                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                                    >
                                                        {unit}
                                                    </span>
                                                    <span
                                                        className="text-[9px] font-bold text-[#8BA888]"
                                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                                    >
                                                        Cleared
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="py-24 lg:py-32 bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <h2
                        className="text-4xl md:text-5xl font-normal text-[#1A1A2E] leading-tight mb-4"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Everything you need
                    </h2>
                    <p
                        className="text-lg text-[#1A1A2E]/60 max-w-2xl mx-auto"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        The full power of Estate, now in your pocket
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex items-start gap-4 p-6 rounded-2xl border border-[#1A1A2E]/8 bg-[#FAF7F2]/50"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1A1A2E]/5 text-[#1A1A2E]">
                                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3
                                        className="text-lg font-semibold text-[#1A1A2E] mb-1"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        className="text-sm text-[#1A1A2E]/60 leading-relaxed"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function DownloadSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} id="download" className="py-24 lg:py-32 bg-[#FAF7F2]">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <h2
                        className="text-4xl md:text-5xl font-normal text-[#1A1A2E] leading-tight mb-6"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Download Estate today
                    </h2>
                    <p
                        className="text-lg text-[#1A1A2E]/60 max-w-xl mx-auto mb-10"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Available on iOS and Android. Free to download, free to use for tenants.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {/* App Store button */}
                        <a
                            href="#"
                            className="inline-flex items-center gap-3 rounded-full bg-[#1A1A2E] px-8 py-4 text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E]"
                        >
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wide opacity-80">Download on the</div>
                                <div className="text-base font-semibold -mt-0.5">App Store</div>
                            </div>
                        </a>

                        {/* Google Play button */}
                        <a
                            href="#"
                            className="inline-flex items-center gap-3 rounded-full bg-[#1A1A2E] px-8 py-4 text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E]"
                        >
                            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.711-2.302 2.711-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                            </svg>
                            <div className="text-left">
                                <div className="text-[10px] uppercase tracking-wide opacity-80">Get it on</div>
                                <div className="text-base font-semibold -mt-0.5">Google Play</div>
                            </div>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default function MobileApp() {
    return (
        <MarketingLayout>
            <Head title="Mobile App — Estate">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Download the Estate mobile app for iOS and Android. Manage your properties, track rent payments, and handle maintenance on the go."
                />
            </Head>

            <Navbar />
            <MobileAppHero />
            <FeaturesSection />
            <DownloadSection />
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
