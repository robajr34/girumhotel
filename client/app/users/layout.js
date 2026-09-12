import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "User Management",
  description: "Manage Grum Hotel system users, account status, and access.",
  path: "/users",
  robots: PRIVATE_ROBOTS,
});

export default function UsersLayout({ children }) {
  return children;
}
