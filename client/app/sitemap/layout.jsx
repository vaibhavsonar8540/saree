import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.SITEMAP);

export default function SitemapLayout({ children }) {
  return children;
}
