import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative z-[60] bg-[#1A1A2E]/[0.04] px-4 py-2"
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span
                                className="rounded-full bg-[#D4A853]/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#D4A853] uppercase"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                What's New
                            </span>
                            <span
                                className="text-sm font-medium text-[#1A1A2E]/80"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Estate v2 is live — Mobile-first payments now available across Tanzania.
                            </span>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[#1A1A2E]/50 transition-colors hover:bg-[#1A1A2E]/10 hover:text-[#1A1A2E]"
                            aria-label="Dismiss announcement"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
