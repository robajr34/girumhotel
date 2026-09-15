import { getPageMetadata } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Hotel Gallery",
  description: "Explore Girum Hotel and discover our rooms, spaces, and facilities in Fiche, Ethiopia.",
  path: "/gallery",
});

export default function GalleryLayout({ children }) {
  return children;
}
