import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.ABOUT_US);

export default function AboutLayout({ children }) {
  return children;
}
