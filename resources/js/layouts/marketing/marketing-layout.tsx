import { type ReactNode } from 'react';

interface MarketingLayoutProps {
    children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A2E] antialiased">
            {children}
        </div>
    );
}
