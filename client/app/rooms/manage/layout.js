import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Room Management",
  description: "Manage room inventory, availability, pricing, and details for Grum Hotel.",
  path: "/rooms/manage",
  robots: PRIVATE_ROBOTS,
});

export default function ManageRoomsLayout({ children }) {
  return children;
}
