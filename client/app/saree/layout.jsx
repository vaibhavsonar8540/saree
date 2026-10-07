import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.SAREES);

export default function SingleSareeLayout({ children }) {
  return children;
}
