import type {Metadata} from "next";

type Props = {
    children: React.ReactNode;
    params: Promise<{
        locale: string;
    }>;
};

export async function generateMetadata({
                                           params,
                                       }: Props): Promise<Metadata> {
    const {locale} = await params;

    const isPersian = locale === "fa";

    return {
        title: {
            default: "WrapLink",
            template: "%s | WrapLink",
        },

        description: isPersian
            ? "شبکه و پلتفرم نسل جدید اتصال برای گیمرها."
            : "Next generation gamer network and connectivity platform.",

        alternates: {
            languages: {
                en: "/",
                fa: "/fa",
            },
        },
    };
}

export default async function LocaleLayout({
                                               children,
                                           }: Props) {
    return children;
}