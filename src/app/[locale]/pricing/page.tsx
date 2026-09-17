import PricingContent from "@/components/pricing/PricingContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function PricingPage({params}: Props) {

    const {locale} = await params;

    return (
        <PricingContent locale={locale}/>
    );
}