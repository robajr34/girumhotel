import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Dashboard",
  description: "Review bookings, rooms, guests, and operating metrics for Grum Hotel.",
  path: "/dashboard",
  robots: PRIVATE_ROBOTS,
});

export default function DashboardLayout({ children }) {
  return children;
}
