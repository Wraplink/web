import ConnectionContent from "@/components/connection/ConnectionContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function ConnectionPage({
                                                 params
                                             }: Props) {

    const {locale} = await params;

    return (
        <ConnectionContent locale={locale}/>
    );
}