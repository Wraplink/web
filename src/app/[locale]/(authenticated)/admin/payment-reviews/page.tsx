import PaymentReviewContent from "@/components/admin/PaymentReviewContent";

export default async function Page({params}: {params: Promise<{locale: string}>}) {
 const {locale} = await params;
 return <PaymentReviewContent locale={locale}/>;
}
