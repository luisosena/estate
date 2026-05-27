import { Head } from '@inertiajs/react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import CtaSection from '@/pages/website/components/cta-section';
import Footer from '@/pages/website/components/footer';
import HeroSection from '@/pages/website/components/hero-section';
import Navbar from '@/pages/website/components/navbar';
import PainSolutionSection from '@/pages/website/components/pain-solution-section';
import SplitValuePropSection from '@/pages/website/components/split-value-prop-section';
import SocialProof from '@/pages/website/components/social-proof';
import TestimonialsSection from '@/pages/website/components/testimonials-section';

export default function Home() {
    return (
        <MarketingLayout>
            <Head title="Property Management, Simplified">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&family=Nunito:wght@700;800;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Estate — The all-in-one property management platform for landlords and tenants. Track properties, manage payments, handle maintenance, all in one beautiful dashboard."
                />
            </Head>

            <Navbar />
            <HeroSection />
            <PainSolutionSection />
            <SplitValuePropSection />
            <SocialProof />
            <TestimonialsSection />
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
