import { getPageMetadata } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Room Details",
  description: "View room features, availability, and booking details at Grum Hotel.",
  path: "/rooms",
});

export default function RoomDetailLayout({ children }) {
  return children;
}
