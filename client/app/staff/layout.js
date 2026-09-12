import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Staff Directory",
  description: "Manage Grum Hotel staff accounts, roles, and invitations.",
  path: "/staff",
  robots: PRIVATE_ROBOTS,
});

export default function StaffLayout({ children }) {
  return children;
}
