import BandwidthContent from "@/components/bandwidth/BandwidthContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function LocaleBandwidthPage({
                                                      params,
                                                  }: Props) {
    const {locale} = await params;

    return <BandwidthContent key={locale}/>;
}