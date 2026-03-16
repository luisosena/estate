import { Link } from '@inertiajs/react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setScrolled(latest > 60);
    });

    return (
        <motion.nav
            className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
            style={{
                backgroundColor: scrolled ? 'rgba(250, 247, 242, 0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(26, 26, 46, 0.06)' : '1px solid transparent',
            }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2">
                    <span
                        className="text-xl font-extralight uppercase tracking-[0.3em] text-[#1A1A2E]"
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                        Estate
                    </span>
                </Link>

                {/* Center Nav Links */}
                <div className="hidden items-center gap-8 md:flex">
                    {['Features', 'How It Works', 'Pricing'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-medium tracking-wide text-[#1A1A2E]/60 transition-colors duration-200 hover:text-[#1A1A2E]"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Right side CTAs */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="hidden text-sm font-medium tracking-wide text-[#1A1A2E]/70 transition-colors duration-200 hover:text-[#1A1A2E] sm:block"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Log in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-full bg-[#1A1A2E] px-6 py-2.5 text-sm font-medium tracking-wide text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E] hover:shadow-lg hover:shadow-[#1A1A2E]/10"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
