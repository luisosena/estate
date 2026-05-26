import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Building2, ChevronDown, Menu, Receipt, ShieldCheck, TrendingUp, Wrench, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const megaMenuItems = [
    {
        title: 'Property Management',
        description: 'Manage properties, units, and occupancy with ease.',
        icon: Building2,
        href: '#property-management',
    },
    {
        title: 'Rent & Billing',
        description: 'Automated rent reconciliation with M-Pesa, Airtel Money & banks.',
        icon: Receipt,
        href: '#billing',
    },
    {
        title: 'Maintenance & SLAs',
        description: 'Track work orders, dispatch vendors, and enforce SLAs.',
        icon: Wrench,
        href: '#maintenance',
    },
    {
        title: 'Financial Reporting',
        description: 'Real-time dashboards and EFD-compliant ledger reports.',
        icon: TrendingUp,
        href: '#reporting',
    },
    {
        title: 'Tenant Portal',
        description: 'Self-service portal for payments, tickets, and token purchases.',
        icon: ShieldCheck,
        href: '#tenant-portal',
    },
    {
        title: 'Utility Management',
        description: 'Automated LUKU token tracking, water, and utility reconciliation.',
        icon: Zap,
        href: '#utilities',
    },
];

export default function Navbar() {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [offerOpen, setOfferOpen] = useState(false);
    const [navbarExpanded, setNavbarExpanded] = useState(false);
    const [mobileOfferOpen, setMobileOfferOpen] = useState(false);
    const offerRef = useRef<HTMLDivElement>(null);
    const openTimer = useRef<ReturnType<typeof setTimeout>>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout>>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useMotionValueEvent(scrollY, 'change', (latest) => {
        if (mounted) {
            setScrolled(latest > 60);
        }
    });

    const handleOpen = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        if (!offerOpen) {
            openTimer.current = setTimeout(() => {
                setOfferOpen(true);
                setNavbarExpanded(true);
            }, 80);
        }
    };

    const handleClose = () => {
        if (openTimer.current) {
            clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        closeTimer.current = setTimeout(() => setOfferOpen(false), 150);
    };

    return (
        <>
            <AnimatePresence>
                {offerOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </AnimatePresence>

            <motion.nav
                className={`fixed z-50 overflow-hidden transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
                    navbarExpanded
                        ? 'inset-x-0 top-0 rounded-none border-b border-[#1A1A2E]/6'
                        : scrolled
                        ? 'inset-x-4 top-4 rounded-full border border-[#1A1A2E]/6'
                        : 'inset-x-4 top-4 rounded-full border border-transparent'
                }`}
                style={{
                    backgroundColor: (scrolled || navbarExpanded) ? 'rgba(250, 247, 242, 0.92)' : 'rgba(250, 247, 242, 0)',
                    backdropFilter: (scrolled || navbarExpanded) ? 'blur(20px)' : 'blur(0px)',
                    boxShadow: (scrolled || navbarExpanded)
                        ? '0 20px 40px -15px rgba(26, 26, 46, 0.1), 0 1px 3px rgba(26, 26, 46, 0.05)'
                        : 'none',
                }}
                onMouseLeave={handleClose}
            >
                <div className="w-full">
                    {/* Top row */}
                    <div className={`mx-auto flex max-w-7xl items-center px-6 lg:px-8 ${navbarExpanded ? 'py-4 pt-8' : 'py-4'}`}>
                        {/* Logo */}
                        <Link 
                            href="/" 
                            className="group flex shrink-0 items-center gap-2"
                            onMouseEnter={handleClose}
                        >
                            <span
                                className="text-2xl font-extrabold uppercase tracking-[0.05em] text-[#1A1A2E]"
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                            >
                                Estate
                            </span>
                        </Link>

                        {/* Center Nav Links */}
                        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
                            <div
                                ref={offerRef}
                                className="relative"
                                onMouseEnter={handleOpen}
                            >
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-1 text-sm font-medium tracking-wide text-[#1A1A2E] transition-colors duration-200 hover:text-black hover:bg-[#1A1A2E]/5 rounded-lg px-3 py-2 h-auto"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    What we offer
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                            offerOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </Button>
                            </div>
                            {['How It Works', 'Roadmap'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="text-sm font-medium tracking-wide text-[#1A1A2E] transition-colors duration-200 hover:text-black"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                    onMouseEnter={handleClose}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>

                        {/* Right side CTAs */}
                        <div className="ml-auto flex items-center justify-end gap-4">
                            <div className="hidden items-center gap-4 md:flex">
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="text-sm font-medium tracking-wide text-[#1A1A2E] transition-colors duration-200 hover:text-black"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                    onMouseEnter={handleClose}
                                >
                                    <Link href="/login">
                                        Sign in
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-full bg-[#1A1A2E] px-6 py-2.5 text-sm font-medium tracking-wide text-[#FAF7F2] transition-all duration-200 hover:bg-[#2A2A4E]"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                    onMouseEnter={handleClose}
                                >
                                    <Link href="/register">
                                        Get Started
                                    </Link>
                                </Button>
                            </div>

                            {/* Mobile Menu */}
                            <div className="md:hidden">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A1A2E]/5 text-[#1A1A2E] transition-colors hover:bg-[#1A1A2E]/10"
                                        >
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] border-l-[#1A1A2E]/10 bg-[#FAF7F2] p-6">
                                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                        <div className="mt-8 flex flex-col gap-6">
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => setMobileOfferOpen(!mobileOfferOpen)}
                                                        className="flex w-full items-center justify-between text-lg font-medium tracking-wide text-[#1A1A2E]/70 transition-colors hover:text-[#1A1A2E] px-0 hover:bg-transparent h-auto"
                                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                                    >
                                                        What we offer
                                                        <ChevronDown
                                                            className={`h-4 w-4 transition-transform duration-200 ${
                                                                mobileOfferOpen ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </Button>
                                                    {mobileOfferOpen && (
                                                        <div className="mt-2 space-y-1 pl-4">
                                                            {megaMenuItems.map((item) => (
                                                                <a
                                                                    key={item.title}
                                                                    href={item.href}
                                                                    className="block rounded-lg px-4 py-2.5 text-base font-medium text-[#1A1A2E]/70 transition-colors hover:text-[#1A1A2E]"
                                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                                >
                                                                    {item.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {['How It Works', 'Roadmap'].map((item) => (
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
                                            <Separator className="bg-[#1A1A2E]/10" />
                                            <div className="flex flex-col gap-4">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="inline-flex items-center justify-center rounded-full border border-[#1A1A2E]/15 px-6 py-3 text-sm font-medium tracking-wide text-[#1A1A2E] transition-colors hover:bg-[#1A1A2E]/5 bg-transparent"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    <Link href="/login">
                                                        Sign in
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    className="inline-flex items-center justify-center rounded-full bg-[#1A1A2E] px-6 py-3 text-sm font-medium tracking-wide text-[#FAF7F2] transition-colors hover:bg-[#2A2A4E]"
                                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                                >
                                                    <Link href="/register">
                                                        Get Started
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </div>
                        </div>
                    </div>

                    {/* Full-width integrated mega-menu */}
                    <AnimatePresence onExitComplete={() => setNavbarExpanded(false)}>
                        {offerOpen && (
                            <motion.div
                                className="w-full overflow-hidden border-t border-[#1A1A2E]/6 bg-transparent"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                                <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 lg:px-8">
                                    <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                                        {megaMenuItems.map((item) => (
                                            <a
                                                key={item.title}
                                                href={item.href}
                                                className="group/mega flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-[#1A1A2E]/5"
                                            >
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1A1A2E]/5 text-[#1A1A2E] transition-colors group-hover/mega:bg-[#1A1A2E] group-hover/mega:text-white">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div className="pt-0.5">
                                                    <div
                                                        className="text-sm font-semibold text-[#1A1A2E]"
                                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                                    >
                                                        {item.title}
                                                    </div>
                                                    <div
                                                        className="mt-0.5 text-xs leading-relaxed text-[#1A1A2E]/60"
                                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                                    >
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.nav>
        </>
    );
}
