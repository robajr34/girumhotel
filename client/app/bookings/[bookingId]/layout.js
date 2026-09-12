import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Booking Details",
  description: "Review reservation details, guest information, and booking status at Grum Hotel.",
  path: "/bookings",
  robots: PRIVATE_ROBOTS,
});

export default function BookingDetailLayout({ children }) {
  return children;
}
