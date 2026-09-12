import { getPageMetadata } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Dining Menu",
  description: "Explore dining and in-room menu options at Grum Hotel in Fiche, Ethiopia.",
  path: "/menu",
});

export default function MenuLayout({ children }) {
  return children;
}
