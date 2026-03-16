import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

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
    const [active, setActive] = useState(0);

    return (
        <section ref={ref} className="relative bg-white py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5 }}
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

                {/* Testimonial carousel */}
                <div className="mt-16">
                    <motion.div
                        className="mx-auto max-w-3xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="relative rounded-2xl border border-[#1A1A2E]/5 bg-[#FAF7F2] p-8 lg:p-12">
                            {/* Quote mark */}
                            <div
                                className="absolute -top-4 left-8 text-6xl leading-none"
                                style={{ color: testimonials[active].color, fontFamily: "'DM Serif Display', serif" }}
                            >
                                &ldquo;
                            </div>

                            <p
                                className="relative z-10 text-lg leading-relaxed text-[#1A1A2E]/70 lg:text-xl"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {testimonials[active].quote}
                            </p>

                            <div className="mt-8 flex items-center gap-4">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                                    style={{ backgroundColor: testimonials[active].color, fontFamily: "'Outfit', sans-serif" }}
                                >
                                    {testimonials[active].avatar}
                                </div>
                                <div>
                                    <div
                                        className="font-medium text-[#1A1A2E]"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {testimonials[active].name}
                                    </div>
                                    <div
                                        className="text-sm text-[#1A1A2E]/50"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        {testimonials[active].role}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dots */}
                        <div className="mt-8 flex items-center justify-center gap-3">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActive(i)}
                                    className="group relative h-3 w-3 rounded-full transition-all duration-300"
                                    style={{
                                        backgroundColor:
                                            active === i
                                                ? testimonials[i].color
                                                : 'rgba(26, 26, 46, 0.15)',
                                    }}
                                    aria-label={`Testimonial ${i + 1}`}
                                >
                                    {active === i && (
                                        <motion.div
                                            className="absolute inset-[-3px] rounded-full border-2"
                                            style={{ borderColor: testimonials[i].color }}
                                            layoutId="testimonial-ring"
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
