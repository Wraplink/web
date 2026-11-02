import MarketContent from "@/components/market/MarketContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function MarketPage({params}: Props) {
    const {locale} = await params;

    return <MarketContent locale={locale}/>;
}