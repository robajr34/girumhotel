import { getPageMetadata } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Rooms",
  description: "Explore rooms and accommodation options at Grum Hotel in Fiche, Ethiopia.",
  path: "/rooms",
});

export default function RoomsLayout({ children }) {
  return children;
}
