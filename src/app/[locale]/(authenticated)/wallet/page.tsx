import WalletContent from "@/components/wallet/WalletContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function WalletPage({
                                             params
                                         }: Props) {

    const {locale} = await params;

    return (
        <WalletContent locale={locale}/>
    );
}