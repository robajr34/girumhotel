import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Guest Directory",
  description: "Manage guest profiles and reservation records for Grum Hotel.",
  path: "/guests",
  robots: PRIVATE_ROBOTS,
});

export default function GuestsLayout({ children }) {
  return children;
}
