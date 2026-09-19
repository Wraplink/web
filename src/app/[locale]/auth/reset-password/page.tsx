import ResetPasswordContent from "@/components/auth/ResetPasswordContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function ResetPasswordPage({
                                                    params,
                                                }: Props) {
    const {locale} = await params;

    return (
        <ResetPasswordContent locale={locale}/>
    );
}