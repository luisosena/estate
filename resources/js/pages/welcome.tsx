import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type AnimationPhase = 'fade-in' | 'hold' | 'move' | 'done';

export default function Welcome() {
    const [phase, setPhase] = useState<AnimationPhase>('fade-in');

    const handleLogout = () => {
        router.post('/logout');
    };

    useEffect(() => {
        // fade-in: 1.2s → hold: 0.5s → move: 0.9s → done
        const holdTimer = setTimeout(() => setPhase('hold'), 1200);
        const moveTimer = setTimeout(() => setPhase('move'), 1700);
        const doneTimer = setTimeout(() => setPhase('done'), 2600);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(moveTimer);
            clearTimeout(doneTimer);
        };
    }, []);

    const isDone = phase === 'done';
    const shouldMove = phase === 'move' || isDone;

    return (
        <div className="relative flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
            {/* Animated ESTATE logo */}
            <motion.h1
                className="pointer-events-none fixed z-50 select-none font-sans font-light uppercase"
                initial={{
                    opacity: 0,
                    scale: 0.5,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    left: '2rem',
                    letterSpacing: '0.3em',
                    fontSize: '1.25rem',
                }}
                transition={{
                    opacity: { duration: 0.8, ease: 'easeOut' },
                    scale: { duration: 0.8, ease: 'easeOut' },
                }}
            >
                Estate
            </motion.h1>

            {/* Content fades in after logo settles */}
            <AnimatePresence>
                {isDone && (
                    <>
                        {/* Header with nav links */}
                        <motion.header
                            className="fixed top-0 right-0 left-0 z-40 flex items-center justify-end px-8 py-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        >
                            <nav className="flex items-center gap-6">
                                <Link
                                    href="/login"
                                    className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full border border-foreground/20 px-5 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
                                >
                                    Register
                                </Link>
                            </nav>
                        </motion.header>

                        {/* Hero content */}
                        <motion.main
                            className="flex flex-1 flex-col items-center justify-center px-6 pt-24"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
                        >
                            <div className="max-w-xl text-center">
                                <p className="text-lg leading-relaxed font-light text-muted-foreground md:text-xl">
                                    Simplifying property management
                                    <br />
                                    for landlords and tenants.
                                </p>

                                <div className="mt-10 flex items-center justify-center gap-4">
                                    <Link
                                        href="/register"
                                        className="rounded-full bg-foreground px-7 py-3 text-sm font-medium tracking-wide text-background transition-opacity hover:opacity-80"
                                    >
                                        Get Started
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="rounded-full border border-foreground/20 px-7 py-3 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-foreground/5"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </motion.main>

                        {/* Footer */}
                        <motion.footer
                            className="flex items-center justify-center gap-6 px-8 py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Link
                                href="/mail"
                                className="text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Mail
                            </Link>
                            <span className="text-muted-foreground/30">·</span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="cursor-pointer text-xs tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Log out
                            </button>
                        </motion.footer>
                    </>
                )}
            </AnimatePresence>

            {/* Subtle decorative glow */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: isDone ? 1 : 0 }}
                transition={{ duration: 1.5 }}
            >
                <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
            </motion.div>
        </div>
    );
}
