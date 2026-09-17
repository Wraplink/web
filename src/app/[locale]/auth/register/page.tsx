import RegisterContent from "@/components/auth/RegisterContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function RegisterPage({
                                               params,
                                           }: Props) {
    const {locale} = await params;

    return (
        <RegisterContent locale={locale}/>
    );
}