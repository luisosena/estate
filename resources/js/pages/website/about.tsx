import { Head, Link } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Building2, Users, Target, Heart, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import Navbar from '@/pages/website/components/navbar';
import Footer from '@/pages/website/components/footer';
import CtaSection from '@/pages/website/components/cta-section';

const values = [
    {
        icon: Building2,
        title: 'Simplicity First',
        description: 'We believe property management should be intuitive, not intimidating. Our platform is designed to be easy to use from day one.',
    },
    {
        icon: Users,
        title: 'Customer-Centric',
        description: 'Every feature we build is driven by real feedback from landlords and tenants across Africa. Your success is our success.',
    },
    {
        icon: Target,
        title: 'Local Focus',
        description: 'Built specifically for African markets with M-Pesa, Airtel Money, and EFD compliance. We understand the unique challenges you face.',
    },
    {
        icon: Heart,
        title: 'Trust & Transparency',
        description: 'We believe in clear pricing, honest communication, and building long-term relationships with our customers.',
    },
];

const storySections = [
    {
        title: 'Our Mission',
        content: 'To simplify property management for African landlords and tenants by providing an all-in-one platform that handles everything from rent collection to maintenance tracking.',
    },
    {
        title: 'Our Vision',
        content: 'To become the leading property management platform across Africa, empowering millions of landlords to manage their properties efficiently while giving tenants a seamless experience.',
    },
];

function AboutHero() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section
            ref={ref}
            className="relative min-h-[70vh] flex items-center bg-[#FAF7F2] pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
        >
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#D4A853]/8 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#8BA888]/8 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <h1
                        className="text-4xl leading-[1.1] font-normal tracking-tight text-[#1A1A2E] sm:text-6xl lg:text-7xl"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        About{' '}
                        <span className="text-[#D4A853]">Estate</span>
                    </h1>
                    <p
                        className="mx-auto max-w-2xl text-lg md:text-xl text-[#1A1A2E]/60 leading-relaxed mb-10"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        We're on a mission to transform property management across Africa, one property at a time.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-full bg-[#1A1A2E] px-8 py-4 text-base font-semibold text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E] shadow-sm"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/features"
                            className="inline-flex items-center gap-2 rounded-full border border-[#1A1A2E]/15 px-8 py-4 text-base font-semibold text-[#1A1A2E] transition-all duration-200 hover:bg-[#1A1A2E]/5"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            View Features
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function ValueCard({ value, index }: { value: (typeof values)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const Icon = value.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-2xl border border-[#1A1A2E]/8 bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1A1A2E]/5 text-[#1A1A2E] mb-6">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3
                className="text-xl font-semibold text-[#1A1A2E] mb-3"
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                {value.title}
            </h3>
            <p
                className="text-base leading-relaxed text-[#1A1A2E]/60"
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                {value.description}
            </p>
        </motion.div>
    );
}

function StorySection({ section, index }: { section: (typeof storySections)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const isEven = index % 2 === 0;

    return (
        <motion.section
            ref={ref}
            className={`py-24 lg:py-32 ${isEven ? 'bg-[#FAF7F2]' : 'bg-white'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <h2
                    className="text-4xl md:text-5xl font-normal text-[#1A1A2E] leading-tight mb-6"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {section.title}
                </h2>
                <p
                    className="text-lg md:text-xl leading-relaxed text-[#1A1A2E]/60"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {section.content}
                </p>
            </div>
        </motion.section>
    );
}

export default function About() {
    return (
        <MarketingLayout>
            <Head title="About — Estate">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Learn about Estate — our mission, vision, and values. We're transforming property management across Africa with an all-in-one platform for landlords and tenants."
                />
            </Head>

            <Navbar />
            <AboutHero />
            {storySections.map((section, index) => (
                <StorySection key={section.title} section={section} index={index} />
            ))}
            <section className="py-24 lg:py-32 bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2
                            className="text-4xl md:text-5xl font-normal text-[#1A1A2E] leading-tight mb-4"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Our Values
                        </h2>
                        <p
                            className="text-lg text-[#1A1A2E]/60 max-w-2xl mx-auto"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <ValueCard key={value.title} value={value} index={index} />
                        ))}
                    </div>
                </div>
            </section>
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
