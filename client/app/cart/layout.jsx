import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.CART);

export default function CartLayout({ children }) {
  return children;
}
