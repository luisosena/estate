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
                        About{' '}
                        <span className="text-primary">Estate</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
                        We're on a mission to transform property management across Africa, one property at a time.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 shadow-sm"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="/features"
                            className="inline-flex items-center gap-2 rounded-full border border-input px-8 py-4 text-base font-semibold text-foreground transition-all duration-200 hover:bg-muted"
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
            className="rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-foreground mb-6">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
                {value.title}
            </h3>
            <p className="text-base leading-relaxed text-muted-foreground">
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
            className={`py-24 lg:py-32 ${isEven ? 'bg-muted/30' : 'bg-card'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-6">
                    {section.title}
                </h2>
                <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
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
            <section className="py-24 lg:py-32 bg-card">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-4">
                            Our Values
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
