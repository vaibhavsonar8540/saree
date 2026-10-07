import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.CONTACT_US);

export default function ContactLayout({ children }) {
  return children;
}
