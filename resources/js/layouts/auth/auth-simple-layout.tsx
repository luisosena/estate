import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import { home } from '@/routes';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-[#FAF7F2] p-6 md:p-10">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#D4A853]/8 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#8BA888]/6 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#C4775A]/5 blur-3xl" />
            </div>

            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex h-20 w-48 items-center justify-center">
                                <img src="/ESTATE.png" alt="Estate Logo" className="w-48 h-auto object-contain" />
                            </div>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1
                                className="text-xl font-medium text-[#1A1A2E]"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {title}
                            </h1>
                            <p
                                className="text-sm text-[#1A1A2E]/50"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
