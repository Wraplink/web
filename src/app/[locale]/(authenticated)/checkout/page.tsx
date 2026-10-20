import type {Metadata} from "next";
import CheckoutContent from "@/components/checkout/CheckoutContent";

type Props = {params: Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;
 return {title:locale==="fa"?"تکمیل خرید":"Checkout"};
}
export default async function CheckoutPage({params}:Props){
 const {locale}=await params;
 return <CheckoutContent locale={locale}/>;
}
