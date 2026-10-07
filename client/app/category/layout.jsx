import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.CATEGORY);

export default function CategoryLayout({ children }) {
  return children;
}
