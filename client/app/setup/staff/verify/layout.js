import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Activate Staff Account",
  description: "Activate a staff invitation and complete the Grum Hotel team member profile.",
  path: "/setup/staff/verify",
  robots: PRIVATE_ROBOTS,
});

export default function DirectStaffVerifyLayout({ children }) {
  return children;
}
