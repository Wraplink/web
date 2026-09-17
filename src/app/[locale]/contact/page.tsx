import ContactContent from "@/components/contact/ContactContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function ContactPage({
                                              params
                                          }: Props) {

    const {locale} = await params;

    return (
        <ContactContent locale={locale}/>
    );
}