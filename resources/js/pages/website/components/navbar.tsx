import { Link } from '@inertiajs/react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function Navbar() {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (mounted) {
            setScrolled(latest > 60);
        }
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
                    {['Features', 'How It Works', 'Roadmap'].map((item) => (
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
                    <div className="hidden items-center gap-4 md:flex">
                        <Link
                            href="/login"
                            className="text-sm font-medium tracking-wide text-[#1A1A2E]/70 transition-colors duration-200 hover:text-[#1A1A2E]"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="rounded-full bg-[#1A1A2E] px-6 py-2.5 text-sm font-medium tracking-wide text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E] hover:border-black"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Request Pilot Access
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A2E]/5 text-[#1A1A2E] transition-colors hover:bg-[#1A1A2E]/10">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] border-l-[#1A1A2E]/10 bg-[#FAF7F2] p-6">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <div className="mt-8 flex flex-col gap-6">
                                    <div className="flex flex-col gap-4">
                                        {['Features', 'How It Works', 'Roadmap'].map((item) => (
                                            <a
                                                key={item}
                                                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                                className="text-lg font-medium tracking-wide text-[#1A1A2E]/70 transition-colors hover:text-[#1A1A2E]"
                                                style={{ fontFamily: "'Outfit', sans-serif" }}
                                            >
                                                {item}
                                            </a>
                                        ))}
                                    </div>
                                    <div className="h-px w-full bg-[#1A1A2E]/10" />
                                    <div className="flex flex-col gap-4">
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center justify-center rounded-full border border-[#1A1A2E]/15 px-6 py-3 text-sm font-medium tracking-wide text-[#1A1A2E] transition-colors hover:bg-[#1A1A2E]/5"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="inline-flex items-center justify-center rounded-full bg-[#1A1A2E] px-6 py-3 text-sm font-medium tracking-wide text-[#FAF7F2] transition-colors hover:bg-[#2A2A4E]"
                                            style={{ fontFamily: "'Outfit', sans-serif" }}
                                        >
                                            Request Pilot Access
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
