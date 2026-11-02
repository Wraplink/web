import type {Metadata} from "next";

import BasketContent from "@/components/basket/BasketContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({
                                           params,
                                       }: Props): Promise<Metadata> {
    const {locale} = await params;

    return {
        title:
            locale === "fa"
                ? "سبد خرید"
                : "Basket",
    };
}

export default async function BasketPage({
                                             params,
                                         }: Props) {
    const {locale} = await params;

    return (
        <BasketContent locale={locale}/>
    );
}