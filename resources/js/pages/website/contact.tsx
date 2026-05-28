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
            className="relative min-h-[50vh] flex items-center bg-[#FAF7F2] pt-36 pb-24 lg:pt-44 lg:pb-32 overflow-hidden"
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
                        Get in{' '}
                        <span className="text-[#D4A853]">touch</span>
                    </h1>
                    <p
                        className="mx-auto max-w-2xl text-lg md:text-xl text-[#1A1A2E]/60 leading-relaxed mt-6"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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
            className="rounded-2xl border border-[#1A1A2E]/8 bg-white p-8 shadow-sm"
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1A1A2E]/5 text-[#1A1A2E] mb-6">
                <Icon className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3
                className="text-lg font-semibold text-[#1A1A2E] mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                {info.title}
            </h3>
            {info.link ? (
                <a
                    href={info.link}
                    className="text-base text-[#1A1A2E]/60 hover:text-[#D4A853] transition-colors"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {info.value}
                </a>
            ) : (
                <p
                    className="text-base text-[#1A1A2E]/60"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
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
        // TODO: Implement form submission logic
        console.log('Form submitted:', formData);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#1A1A2E]/8 bg-white p-8 shadow-sm"
        >
            <h2
                className="text-2xl font-semibold text-[#1A1A2E] mb-6"
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                Send us a message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-[#1A1A2E] mb-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-[#1A1A2E] mb-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-[#1A1A2E] mb-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-[#1A1A2E] mb-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
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
                    className="w-full rounded-full bg-[#1A1A2E] px-8 py-4 text-base font-semibold text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E]"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Contact the Estate team. Get in touch with us for questions, support, or inquiries about our property management platform."
                />
            </Head>

            <Navbar />
            <ContactHero />
            <section className="py-24 lg:py-32 bg-[#FAF7F2]">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div>
                            <h2
                                className="text-3xl md:text-4xl font-normal text-[#1A1A2E] leading-tight mb-6"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Contact Information
                            </h2>
                            <p
                                className="text-lg text-[#1A1A2E]/60 mb-10"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
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
