import SupportContent from "@/components/support/SupportContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function LocaleSupportPage({
                                                    params,
                                                }: Props) {
    const {locale} = await params;

    return <SupportContent key={locale}/>;
}