import type {Metadata} from "next";
import BasketContent from "@/components/basket/BasketContent";

export const metadata: Metadata = {title: "سبد خرید"};

export default function BasketPage() {
    return <BasketContent locale="fa"/>;
}
