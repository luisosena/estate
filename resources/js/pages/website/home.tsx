import { Head } from '@inertiajs/react';

import MarketingLayout from '@/layouts/marketing/marketing-layout';
import CtaSection from '@/pages/website/components/cta-section';
import Footer from '@/pages/website/components/footer';
import HeroSection from '@/pages/website/components/hero-section';
import Navbar from '@/pages/website/components/navbar';
import PainSolutionSection from '@/pages/website/components/pain-solution-section';
import FeaturesSection from '@/pages/website/components/features-section';
import AnimationSection from '@/pages/website/components/animation-section';
import SplitValuePropSection from '@/pages/website/components/split-value-prop-section';

export default function Home() {
    return (
        <MarketingLayout>
            <Head title="Property Management, Simplified">
                <meta
                    name="description"
                    content="Estate — The all-in-one property management platform for landlords and tenants. Track properties, manage payments, handle maintenance, all in one beautiful dashboard."
                />
            </Head>

            <Navbar />
            <HeroSection />
            <AnimationSection />
            <PainSolutionSection />
            <FeaturesSection />
            <SplitValuePropSection />
            <CtaSection />
            <Footer />
        </MarketingLayout>
    );
}
