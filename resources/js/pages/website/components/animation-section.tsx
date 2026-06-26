import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const displays = [
    {
        id: 'payment',
        header: 'Automate payment collection',
        description: 'Tenants pay rent instantly via M-Pesa or bank transfer — no chasing, no delays.',
        color: '#D4A853',
    },
    {
        id: 'reports',
        header: 'Automatic financial reports',
        description: 'EFD-compliant receipts, income-vs-expense breakdowns, and audit trails generated instantly.',
        color: '#C4775A',
    },
    {
        id: 'portfolio',
        header: 'Organized property portfolio',
        description: 'Track every property, tenant, and unit in one beautiful, centralized dashboard.',
        color: '#8BA888',
    },
];

function PaymentSvg({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Wallet body */}
            <motion.rect
                x="30" y="60" width="140" height="100" rx="12"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
            {/* Wallet flap */}
            <motion.path
                d="M30 80 Q30 60 50 60 L150 60 Q170 60 170 80"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
            />
            {/* Card slot */}
            <motion.rect
                x="50" y="90" width="60" height="8" rx="4"
                fill={color} fillOpacity="0.3"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                style={{ transformOrigin: 'left' }}
            />
            {/* Money flowing in */}
            <motion.g
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <rect x="130" y="30" width="40" height="24" rx="4" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
                <text x="150" y="46" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">$</text>
            </motion.g>
            {/* Coin circle */}
            <motion.circle
                cx="80" cy="130" r="15"
                fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 1, type: 'spring' }}
            />
            <motion.text
                x="80" y="134" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                T
            </motion.text>
            {/* Checkmark */}
            <motion.path
                d="M145 110 L155 120 L170 100"
                stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
            />
            {/* Glow effect */}
            <motion.circle
                cx="100" cy="100" r="80"
                fill={color} fillOpacity="0.05"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
            />
        </svg>
    );
}

function ReportsSvg({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Document outline */}
            <motion.rect
                x="40" y="20" width="120" height="160" rx="8"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            />
            {/* Document fold corner */}
            <motion.path
                d="M120 20 L160 60"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
            />
            <motion.path
                d="M120 20 L120 60 L160 60"
                stroke={color} strokeWidth="2" fill={color} fillOpacity="0.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            />
            {/* Bar chart */}
            <motion.rect
                x="55" y="120" width="12" height="40" rx="2"
                fill={color} fillOpacity="0.4"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                style={{ transformOrigin: 'bottom' }}
            />
            <motion.rect
                x="75" y="100" width="12" height="60" rx="2"
                fill={color} fillOpacity="0.6"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 1 }}
                style={{ transformOrigin: 'bottom' }}
            />
            <motion.rect
                x="95" y="80" width="12" height="80" rx="2"
                fill={color} fillOpacity="0.8"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                style={{ transformOrigin: 'bottom' }}
            />
            <motion.rect
                x="115" y="90" width="12" height="70" rx="2"
                fill={color}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 1.4 }}
                style={{ transformOrigin: 'bottom' }}
            />
            {/* Trend line */}
            <motion.path
                d="M55 115 L75 95 L95 75 L115 85"
                stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
            />
            {/* Text lines */}
            <motion.line
                x1="55" y1="45" x2="100" y2="45"
                stroke={color} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            />
            <motion.line
                x1="55" y1="55" x2="85" y2="55"
                stroke={color} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            />
            {/* Auto-generate sparkle */}
            <motion.g
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.8, type: 'spring' }}
                style={{ transformOrigin: '145px 145px' }}
            >
                <circle cx="145" cy="145" r="18" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="2" />
                <path d="M145 135 L145 155 M135 145 L155 145" stroke={color} strokeWidth="2" strokeLinecap="round" />
            </motion.g>
            {/* Glow */}
            <motion.circle
                cx="100" cy="100" r="85"
                fill={color} fillOpacity="0.04"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
            />
        </svg>
    );
}

function PortfolioSvg({ color }: { color: string }) {
    return (
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Building 1 - tall */}
            <motion.rect
                x="30" y="50" width="45" height="120" rx="4"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            {/* Windows building 1 */}
            {[60, 80, 100, 120, 140].map((y, i) => (
                <motion.rect
                    key={`b1-${i}`}
                    x="38" y={y} width="10" height="10" rx="1"
                    fill={color} fillOpacity="0.3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.4 + i * 0.1 }}
                />
            ))}
            {[60, 80, 100, 120, 140].map((y, i) => (
                <motion.rect
                    key={`b1b-${i}`}
                    x="57" y={y} width="10" height="10" rx="1"
                    fill={color} fillOpacity="0.3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.5 + i * 0.1 }}
                />
            ))}

            {/* Building 2 - medium */}
            <motion.rect
                x="85" y="80" width="40" height="90" rx="4"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            />
            {[90, 110, 130, 150].map((y, i) => (
                <motion.rect
                    key={`b2-${i}`}
                    x="92" y={y} width="10" height="8" rx="1"
                    fill={color} fillOpacity="0.4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.7 + i * 0.1 }}
                />
            ))}
            {[90, 110, 130, 150].map((y, i) => (
                <motion.rect
                    key={`b2b-${i}`}
                    x="108" y={y} width="10" height="8" rx="1"
                    fill={color} fillOpacity="0.4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.8 + i * 0.1 }}
                />
            ))}

            {/* Building 3 - small */}
            <motion.rect
                x="135" y="110" width="35" height="60" rx="4"
                stroke={color} strokeWidth="3" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            />
            {[118, 135, 152].map((y, i) => (
                <motion.rect
                    key={`b3-${i}`}
                    x="142" y={y} width="8" height="7" rx="1"
                    fill={color} fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 1 + i * 0.1 }}
                />
            ))}
            {[118, 135, 152].map((y, i) => (
                <motion.rect
                    key={`b3b-${i}`}
                    x="156" y={y} width="8" height="7" rx="1"
                    fill={color} fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 1.1 + i * 0.1 }}
                />
            ))}

            {/* Ground line */}
            <motion.line
                x1="20" y1="170" x2="180" y2="170"
                stroke={color} strokeWidth="2" strokeOpacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            />

            {/* Organization lines / connections */}
            <motion.path
                d="M75 120 Q90 100 85 110"
                stroke={color} strokeWidth="1.5" strokeDasharray="4 4" fill="none" strokeOpacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
            />
            <motion.path
                d="M125 130 Q135 115 135 120"
                stroke={color} strokeWidth="1.5" strokeDasharray="4 4" fill="none" strokeOpacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 1.6 }}
            />

            {/* Glow */}
            <motion.circle
                cx="100" cy="120" r="70"
                fill={color} fillOpacity="0.05"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
            />
        </svg>
    );
}

const svgComponents = [PaymentSvg, ReportsSvg, PortfolioSvg];

export default function AnimationSection() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displays.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const currentDisplay = displays[currentIndex];
    const CurrentSvg = svgComponents[currentIndex];

    return (
        <section className="relative bg-background py-24 lg:py-32 overflow-hidden">
            {/* Subtle background gradients */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-success/5 blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section header */}
                <motion.div
                    className="mx-auto max-w-2xl text-center mb-16 lg:mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-6xl font-normal text-foreground leading-tight">
                        Estate in action
                    </h2>
                    <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                        Watch how Estate transforms property management — automating payments, generating reports, and organizing your portfolio.
                    </p>
                </motion.div>

                {/* Display area */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 min-h-[320px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentDisplay.id}
                            className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 30 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="w-full max-w-[280px] lg:max-w-[320px] aspect-square">
                                <CurrentSvg color={currentDisplay.color} />
                            </div>
                            <div className="flex-1 max-w-lg">
                                <h3 className="text-3xl md:text-4xl lg:text-5xl font-normal text-foreground leading-tight">
                                    {currentDisplay.header}
                                </h3>
                                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                                    {currentDisplay.description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    {displays.map((display, index) => (
                        <button
                            key={display.id}
                            onClick={() => setCurrentIndex(index)}
                            className="relative p-1 transition-transform duration-200 hover:scale-110"
                            aria-label={`Go to ${display.header}`}
                        >
                            <div
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                    index === currentIndex
                                        ? 'scale-110'
                                        : 'bg-foreground/20 hover:bg-foreground/30'
                                }`}
                                style={
                                    index === currentIndex
                                        ? { backgroundColor: display.color }
                                        : undefined
                                }
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
