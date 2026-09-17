import ForgotPasswordContent from "@/components/auth/ForgotPasswordContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function ForgotPasswordPage({params}: Props) {
    const {locale} = await params;

    return (
        <ForgotPasswordContent locale={locale}/>
    );
}
