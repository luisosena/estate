import { type ReactNode } from 'react';

interface MarketingLayoutProps {
    children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            {children}
        </div>
    );
}
