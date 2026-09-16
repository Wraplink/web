import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";

import LocaleDocument from "@/components/layout/LocaleDocument";

import en from "@/messages/en.json";
import fa from "@/messages/fa.json";

export const metadata: Metadata = {
    title: {
        default: "WrapLink",
        template: "%s | WrapLink",
    },
    description:
        "Next generation gamer network and connectivity platform.",
};

type Props = {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
    }>;
};

export default async function LocaleLayout({
                                               children,
                                           }: Props) {
    return children;
}