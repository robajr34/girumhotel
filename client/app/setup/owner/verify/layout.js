import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Verify Owner Account",
  description: "Verify the owner account and complete setup for the Grum Hotel management system.",
  path: "/setup/owner/verify",
  robots: PRIVATE_ROBOTS,
});

export default function DirectOwnerVerifyLayout({ children }) {
  return children;
}
