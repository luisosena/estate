import { Link } from '@inertiajs/react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Building2, ChevronDown, Menu, Receipt, ShieldCheck, TrendingUp, Wrench, Zap, Smartphone, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { TryDemoButton } from '@/components/try-demo-button';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
        href: '/features#rent-billing',
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
        href: '/features#utility-management',
    },
];

const resourcesMenuItems = [
    {
        title: 'Mobile App',
        description: 'Manage properties on the go with our iOS and Android apps.',
        icon: Smartphone,
        href: '/resources/mobile-app',
    },
    {
        title: 'Documentation',
        description: 'Comprehensive guides and API documentation.',
        icon: BookOpen,
        href: '/resources/docs',
    },
    {
        title: 'Video Tutorials',
        description: 'Step-by-step video guides for all features.',
        icon: Video,
        href: '/resources/tutorials',
    },
    {
        title: 'Blog',
        description: 'Latest news, tips, and industry insights.',
        icon: FileText,
        href: '/resources/blog',
    },
    {
        title: 'Help Center',
        description: 'FAQs and support resources.',
        icon: HelpCircle,
        href: '/resources/help',
    },
];

export default function Navbar() {
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [offerOpen, setOfferOpen] = useState(false);
    const [resourcesOpen, setResourcesOpen] = useState(false);
    const [navbarExpanded, setNavbarExpanded] = useState(false);
    const [mobileOfferOpen, setMobileOfferOpen] = useState(false);
    const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
    const offerRef = useRef<HTMLDivElement>(null);
    const resourcesRef = useRef<HTMLDivElement>(null);
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
                setResourcesOpen(false);
                setNavbarExpanded(true);
            }, 80);
        }
    };

    const handleResourcesOpen = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        if (!resourcesOpen) {
            openTimer.current = setTimeout(() => {
                setResourcesOpen(true);
                setOfferOpen(false);
                setNavbarExpanded(true);
            }, 80);
        }
    };

    const handleClose = () => {
        if (openTimer.current) {
            clearTimeout(openTimer.current);
            openTimer.current = null;
        }
        closeTimer.current = setTimeout(() => {
            setOfferOpen(false);
            setResourcesOpen(false);
        }, 150);
    };

    return (
        <>
            <AnimatePresence>
                {(offerOpen || resourcesOpen) && (
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
                        ? 'inset-x-0 top-0 rounded-none border-b border-border'
                        : scrolled
                        ? 'inset-x-4 top-4 rounded-full border border-border'
                        : 'inset-x-4 top-4 rounded-full border border-transparent'
                }`}
                style={{
                    backgroundColor: (scrolled || navbarExpanded) ? 'oklch(0.99 0.003 162 / 0.92)' : 'oklch(0.99 0.003 162 / 0)',
                    backdropFilter: (scrolled || navbarExpanded) ? 'blur(20px)' : 'blur(0px)',
                    boxShadow: (scrolled || navbarExpanded)
                        ? '0 20px 40px -15px rgb(0 0 0 / 0.08), 0 1px 3px rgb(0 0 0 / 0.04)'
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
                            <img
                                src="/ESTATE.png"
                                alt="ESTATE"
                                className="h-7 w-auto"
                            />
                        </Link>

                        {/* Center Nav Links */}
                        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
                            <div
                                ref={offerRef}
                                className="relative"
                                onMouseEnter={handleOpen}
                            >
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="flex items-center gap-1 text-sm font-medium tracking-wide text-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 h-auto"
                                >
                                    <Link href="/features">
                                        What we offer
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                                offerOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </Link>
                                </Button>
                            </div>
                            <div
                                ref={resourcesRef}
                                className="relative"
                                onMouseEnter={handleResourcesOpen}
                            >
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="flex items-center gap-1 text-sm font-medium tracking-wide text-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted rounded-lg px-3 py-2 h-auto"
                                >
                                    <Link href="/resources">
                                        Resources
                                        <ChevronDown
                                            className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                                resourcesOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </Link>
                                </Button>
                            </div>
                            {['About', 'Contact'].map((item) => {
                                const href = item === 'About' ? '/about' : item === 'Contact' ? '/contact' : `#${item.toLowerCase().replace(/\s+/g, '-')}`;
                                const Component = href.startsWith('/') ? Link : 'a';
                                return (
                                    <Component
                                        key={item}
                                        href={href}
                                        className="text-sm font-medium tracking-wide text-foreground transition-colors duration-200 hover:text-foreground"
                                        onMouseEnter={handleClose}
                                    >
                                        {item}
                                    </Component>
                                );
                            })}
                        </div>

                        {/* Right side CTAs */}
                        <div className="ml-auto flex items-center justify-end gap-4">
                            <div className="hidden items-center gap-4 md:flex">
                                <TryDemoButton
                                    variant="ghost"
                                    className="text-sm font-medium tracking-wide text-foreground hover:bg-muted"
                                    onMouseEnter={handleClose}
                                />
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="text-sm font-medium tracking-wide text-foreground transition-colors duration-200 hover:text-foreground hover:bg-muted"
                                    onMouseEnter={handleClose}
                                >
                                    <Link href="/login">
                                        Sign in
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium tracking-wide text-primary-foreground transition-all duration-200 hover:bg-primary/90"
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
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80"
                                        >
                                            <Menu className="h-5 w-5" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="w-[300px] border-l-border bg-card p-6">
                                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                        <div className="mt-8 flex flex-col gap-6">
                                            <div className="flex flex-col gap-4">
                                                <div>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        className="flex w-full items-center justify-between text-lg font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground px-0 hover:bg-transparent h-auto"
                                                    >
                                                        <Link href="/features">
                                                            What we offer
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                                <div>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        className="flex w-full items-center justify-between text-lg font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground px-0 hover:bg-transparent h-auto"
                                                    >
                                                        <Link href="/resources">
                                                            Resources
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                                {['About', 'Contact'].map((item) => {
                                                    const href = item === 'About' ? '/about' : item === 'Contact' ? '/contact' : `#${item.toLowerCase().replace(/\s+/g, '-')}`;
                                                    const Component = href.startsWith('/') ? Link : 'a';
                                                    return (
                                                        <Component
                                                            key={item}
                                                            href={href}
                                                            className="text-lg font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                                                        >
                                                            {item}
                                                        </Component>
                                                    );
                                                })}
                                            </div>
                                            <Separator className="bg-border" />
                                            <div className="flex flex-col gap-4">
                                                <TryDemoButton
                                                    variant="outline"
                                                    className="inline-flex w-full items-center justify-center rounded-full border border-input px-6 py-3 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted bg-transparent"
                                                />
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    className="inline-flex items-center justify-center rounded-full border border-input px-6 py-3 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-muted bg-transparent"
                                                >
                                                    <Link href="/login">
                                                        Sign in
                                                    </Link>
                                                </Button>
                                                <Button
                                                    asChild
                                                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
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
                                className="w-full overflow-hidden border-t border-border bg-transparent"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                                <div className="mx-auto max-w-5xl px-6 pb-12 pt-8 lg:px-8">
                                    <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                                        {megaMenuItems.map((item) => {
                                            const Component = item.href.startsWith('/') ? Link : 'a';
                                            return (
                                                <Component
                                                    key={item.title}
                                                    href={item.href}
                                                    className="group/mega flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-muted"
                                                >
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover/mega:bg-foreground group-hover/mega:text-primary-foreground">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <div
                                                            className="text-sm font-semibold text-foreground"
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <div
                                                            className="mt-0.5 text-xs leading-relaxed text-muted-foreground"
                                                        >
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </Component>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {resourcesOpen && (
                            <motion.div
                                className="w-full overflow-hidden border-t border-border bg-transparent"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                                <div className="mx-auto max-w-5xl px-6 pb-12 pt-8 lg:px-8">
                                    <div className="grid grid-cols-1 gap-x-16 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                                        {resourcesMenuItems.map((item) => {
                                            const Component = item.href.startsWith('/') ? Link : 'a';
                                            return (
                                                <Component
                                                    key={item.title}
                                                    href={item.href}
                                                    className="group/mega flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-muted"
                                                >
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover/mega:bg-foreground group-hover/mega:text-primary-foreground">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="pt-0.5">
                                                        <div
                                                            className="text-sm font-semibold text-foreground"
                                                        >
                                                            {item.title}
                                                        </div>
                                                        <div
                                                            className="mt-0.5 text-xs leading-relaxed text-muted-foreground"
                                                        >
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </Component>
                                            );
                                        })}
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
