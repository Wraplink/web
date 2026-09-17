import LoginContent from "@/components/auth/LoginContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function LoginPage({params}: Props) {

    const {locale} = await params;

    return (
        <LoginContent locale={locale}/>
    );
}