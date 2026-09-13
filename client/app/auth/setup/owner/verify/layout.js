import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Verify Owner Account",
  description:
    "Verify your owner invitation and complete the Grum Hotel owner account setup.",
  path: "/auth/setup/owner/verify",
  robots: PRIVATE_ROBOTS,
});

export default function OwnerVerifyLayout({ children }) {
  return children;
}
