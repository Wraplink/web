import VerifyEmailContent from "@/components/auth/VerifyEmailContent";

type Props = {
    params: Promise<{
        locale: string;
    }>;
};

export default async function VerifyEmailPage({
                                                  params
                                              }: Props) {

    const {locale} = await params;

    return <VerifyEmailContent locale={locale}/>;
}