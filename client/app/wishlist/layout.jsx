import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.WISHLIST);

export default function WishlistLayout({ children }) {
  return children;
}
