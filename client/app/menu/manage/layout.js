// client/app/dashboard/menu/manage/layout.js

import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Manage Menu",
  description:
    "Manage Grum Hotel's dining menu, including menu items, prices, categories, availability, and descriptions.",
  path: "/dashboard/menu/manage",
  robots: PRIVATE_ROBOTS,
});

export default function MenuManageLayout({ children }) {
  return children;
}
