import { getPageMetadata, PRIVATE_ROBOTS } from "@/constants/seo";

export const metadata = getPageMetadata({
  title: "Login",
  description:
    "Sign in to your Grum Hotel account to manage bookings and reservations in Fiche, Ethiopia.",
  path: "/auth/login",
  robots: PRIVATE_ROBOTS,
});

export default function LoginLayout({ children }) {
  return children;
}
