import { PAGE_CONSTANT } from "@/app/constant";
import { getPageMetadata } from "@/app/metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.FAVOURITES);

export default function FavouritesLayout({ children }) {
  return children;
}
