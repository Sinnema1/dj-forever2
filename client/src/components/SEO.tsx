import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = "Our Wedding Website",
  description = "Join us as we celebrate our special day. Find all the details about our wedding ceremony, reception, and how to RSVP.",
  image = "/og-image.jpg",
  url = "https://dj-forever2.onrender.com",
  type = "website",
}: SEOProps) {
  const fullTitle =
    title === "Our Wedding Website" ? title : `${title} | Our Wedding Website`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Our Wedding Website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="theme-color" content="#C9A66B" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Preconnect to domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
    </Helmet>
  );
}

// Page-specific SEO components
export function HomePageSEO() {
  return (
    <SEO
      title="Our Wedding Website"
      description="Join us as we celebrate our special day. Find all the details about our wedding ceremony, reception, and how to RSVP."
    />
  );
}

export function RSVPPageSEO() {
  return (
    <SEO
      title="RSVP"
      description="Please let us know if you'll be joining us for our special day. RSVP for our wedding ceremony and reception."
    />
  );
}

export function GalleryPageSEO() {
  return (
    <SEO
      title="Photo Gallery"
      description="Browse through our favorite photos and memories as we prepare for our wedding day."
    />
  );
}

export function TravelPageSEO() {
  return (
    <SEO
      title="Travel & Accommodations"
      description="Find information about travel, hotels, and accommodations for our wedding. Everything you need to plan your visit."
    />
  );
}

export function RegistryPageSEO() {
  return (
    <SEO
      title="Wedding Registry"
      description="Our wedding registry with gift ideas and links to our favorite stores. Your presence is the greatest gift, but if you wish to honor us with a gift, here are our registries."
    />
  );
}
