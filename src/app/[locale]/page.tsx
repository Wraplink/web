import CTA from "@/components/home/CTA";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import PricingPreview from "@/components/home/PricingPreview";
import Stats from "@/components/home/Stats";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function HomePage({
                                           params,
                                       }: Props) {
    const {locale} = await params;

    return (
        <>
            <Hero locale={locale}/>

            <Stats locale={locale}/>

            <Features locale={locale}/>

            <HowItWorks locale={locale}/>

            <PricingPreview locale={locale}/>

            <CTA locale={locale}/>
        </>
    );
}