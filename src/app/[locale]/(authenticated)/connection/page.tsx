import type {Metadata} from "next";

import ConnectionContent from "@/components/connection/ConnectionContent";

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
                ? "اتصال"
                : "Connection",
    };
}

export default async function ConnectionPage({
                                                 params,
                                             }: Props) {
    const {locale} = await params;

    return (
        <ConnectionContent locale={locale}/>
    );
}