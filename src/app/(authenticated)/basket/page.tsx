import type {Metadata} from "next";

import BasketContent from "@/components/basket/BasketContent";

export const metadata: Metadata = {
    title: "Basket",
};

export default function BasketPage() {
    return <BasketContent locale="en"/>;
}