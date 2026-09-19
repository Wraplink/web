import OrdersContent from "@/components/orders/OrdersContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function LocaleOrdersPage({
                                                   params,
                                               }: Props) {
    const {locale} = await params;

    return <OrdersContent key={locale}/>;
}