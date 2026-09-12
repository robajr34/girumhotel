import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Profile",
  description: "Manage your Grum Hotel account profile and security settings.",
  path: "/profile",
  robots: PRIVATE_ROBOTS,
});

export default function ProfileLayout({ children }) {
  return children;
}
