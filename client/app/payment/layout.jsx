import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.PAYMENT);

export default function PaymentLayout({ children }) {
  return children;
}
