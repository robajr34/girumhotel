import { HOTEL } from "./hotel";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
let metadataBase;

if (configuredSiteUrl) {
  try {
    metadataBase = new URL(configuredSiteUrl);
  } catch {
    metadataBase = undefined;
  }
}

const defaultTitle = `${HOTEL.websiteName} | Hotel in ${HOTEL.city}, ${HOTEL.country}`;
const defaultDescription = `Discover ${HOTEL.websiteName} in ${HOTEL.location}. Explore comfortable rooms and book your stay with us.`;
const publicRobots = { index: true, follow: true };
const privateRobots = { index: false, follow: false };

export const SEO_DEFAULTS = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: defaultTitle,
    template: `%s | ${HOTEL.websiteName}`,
  },
  description: defaultDescription,
  keywords: HOTEL.keywords,
  openGraph: {
    type: "website",
    locale: "en_ET",
    siteName: HOTEL.websiteName,
    title: defaultTitle,
    description: defaultDescription,
    ...(metadataBase ? { url: "/" } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: publicRobots,
  ...(metadataBase ? { alternates: { canonical: "/" } } : {}),
};

export const PRIVATE_ROBOTS = privateRobots;

export function getPageMetadata({ title, description, path = "/", robots = publicRobots }) {
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;

  return {
    ...SEO_DEFAULTS,
    title,
    description,
    openGraph: {
      ...SEO_DEFAULTS.openGraph,
      title: `${title} | ${HOTEL.websiteName}`,
      description,
      ...(metadataBase ? { url: canonicalPath } : {}),
    },
    twitter: {
      ...SEO_DEFAULTS.twitter,
      title: `${title} | ${HOTEL.websiteName}`,
      description,
    },
    robots,
    ...(metadataBase ? { alternates: { canonical: canonicalPath } } : {}),
  };
}
