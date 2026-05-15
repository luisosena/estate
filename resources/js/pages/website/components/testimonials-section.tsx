import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
    { value: '2,400+', label: 'Units Managed' },
    { value: '99.4%', label: 'Uptime' },
    { value: '4.8★', label: 'Average Rating' },
];

const testimonials = [
    {
        quote: "Estate transformed how I manage my 12 rental properties. What used to take days of spreadsheet wrangling now takes minutes. The tenant portal alone saved me countless hours.",
        name: 'Sarah Kimani',
        role: 'Property Owner, 12 units',
        avatar: 'SK',
        color: '#D4A853',
    },
    {
        quote: "As a tenant, I love being able to pay rent, track my utilities, and communicate with my landlord all in one place. It's so much better than the old email-and-bank-transfer routine.",
        name: 'James Mwangi',
        role: 'Tenant',
        avatar: 'JM',
        color: '#8BA888',
    },
    {
        quote: "We manage over 200 units across Nairobi. Estate's dashboard gives us real-time visibility into occupancy, payments, and maintenance — it's a game-changer for our operations.",
        name: 'Amina Hassan',
        role: 'Property Manager, 200+ units',
        avatar: 'AH',
        color: '#C4775A',
    },
];

export default function TestimonialsSection() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    return (
        <section ref={ref} className="relative bg-white py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Stats Strip */}
                <motion.div
                    className="mb-24 rounded-2xl border border-[#1A1A2E]/5 bg-[#FAF7F2] py-8 lg:py-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid grid-cols-1 divide-y divide-[#1A1A2E]/5 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                        {stats.map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center py-6 sm:py-0">
                                <div
                                    className="text-4xl font-normal text-[#1A1A2E] lg:text-5xl"
                                    style={{ fontFamily: "'DM Serif Display', serif" }}
                                >
                                    {stat.value}
                                </div>
                                <div
                                    className="mt-2 text-sm font-medium tracking-wide text-[#1A1A2E]/50 uppercase"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p
                        className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[#D4A853]"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        What People Say
                    </p>
                    <h2
                        className="text-3xl font-normal text-[#1A1A2E] sm:text-4xl"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Loved by landlords & tenants
                    </h2>
                </motion.div>

                {/* Testimonial Cards */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <motion.div
                            key={i}
                            className="relative flex flex-col rounded-2xl border border-[#1A1A2E]/5 bg-[#FAF7F2]/50 p-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                        >
                            {/* Quote mark */}
                            <div
                                className="mb-4 text-5xl leading-none opacity-40"
                                style={{ color: testimonial.color, fontFamily: "'DM Serif Display', serif" }}
                            >
                                &ldquo;
                            </div>

                            <p
                                className="flex-1 text-base leading-relaxed text-[#1A1A2E]/70"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {testimonial.quote}
                            </p>

                            <div className="mt-8 flex items-center gap-4 border-t border-[#1A1A2E]/5 pt-6">
                                <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                                    style={{ backgroundColor: testimonial.color, fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div
                                        className="font-semibold text-[#1A1A2E]"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {testimonial.name}
                                    </div>
                                    <div
                                        className="text-xs text-[#1A1A2E]/50 mt-0.5"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
