import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.CHECKOUT);

export default function CheckoutLayout({ children }) {
  return children;
}
