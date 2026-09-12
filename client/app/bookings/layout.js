import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Bookings",
  description: "View and manage reservations for Grum Hotel in Fiche, Ethiopia.",
  path: "/bookings",
  robots: PRIVATE_ROBOTS,
});

export default function BookingsLayout({ children }) {
  return children;
}
