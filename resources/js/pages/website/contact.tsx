import { Head } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useRef, useState } from 'react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import Navbar from '@/pages/website/components/navbar';
import Footer from '@/pages/website/components/footer';
import CtaSection from '@/pages/website/components/cta-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const contactInfo = [
    {
        icon: Mail,
        title: 'Email',
        value: 'hello@estate.africa',
        link: 'mailto:hello@estate.africa',
    },
    {
        icon: Phone,
        title: 'Phone',
        value: '+254 700 000 000',
        link: 'tel:+254700000000',
    },
    {
        icon: MapPin,
        title: 'Location',
        value: 'Nairobi, Kenya',
        link: null,
    },
];

function ContactHero() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section
            ref={ref}
            className="relative min-h-[50vh] flex items-center bg-background pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
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
                        Get in{' '}
                        <span className="text-primary">touch</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

function ContactInfoCard({ info, index }: { info: (typeof contactInfo)[0]; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const Icon = info.icon;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-foreground mb-6">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {info.title}
            </h3>
            {info.link ? (
                <a
                    href={info.link}
                    className="text-base text-muted-foreground hover:text-primary transition-colors"
                >
                    {info.value}
                </a>
            ) : (
                <p className="text-base text-muted-foreground">
                    {info.value}
                </p>
            )}
        </motion.div>
    );
}

function ContactForm() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
            <h2 className="text-2xl font-semibold text-foreground mb-6">
                Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Name
                    </label>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                        Subject
                    </label>
                    <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        required
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message
                    </label>
                    <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us more about your inquiry..."
                        required
                        rows={6}
                        className="w-full"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full rounded-full px-8 py-4 text-base font-semibold"
                >
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                </Button>
            </form>
        </motion.div>
    );
}

export default function Contact() {
    return (
        <MarketingLayout>
            <Head title="Contact — Estate">
                <meta
                    name="description"
                    content="Contact the Estate team. Get in touch with us for questions, support, or inquiries about our property management platform."
                />
            </Head>

            <Navbar />
            <ContactHero />
            <section className="py-24 lg:py-32 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-6">
                                Contact Information
                            </h2>
                            <p className="text-lg text-muted-foreground mb-10">
                                Reach out to us through any of these channels. We're here to help you succeed.
                            </p>
                            <div className="grid grid-cols-1 gap-6">
                                {contactInfo.map((info, index) => (
                                    <ContactInfoCard key={info.title} info={info} index={index} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </section>
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
