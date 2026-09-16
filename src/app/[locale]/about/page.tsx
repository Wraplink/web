import AboutContent from "@/components/about/AboutContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function AboutPage({params}: Props) {
    const {locale} = await params;

    return <AboutContent locale={locale}/>;
}