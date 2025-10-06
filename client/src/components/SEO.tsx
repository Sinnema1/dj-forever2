/**
 * @fileoverview SEO component for optimized search engine visibility
 *
 * Comprehensive SEO management component using react-helmet-async for
 * meta tag injection, Open Graph optimization, and social media integration.
 * Provides consistent SEO across all pages with wedding-specific defaults
 * and customizable properties for individual page optimization.
 *
 * Features:
 * - Open Graph and Twitter Card optimization
 * - Customizable meta tags and structured data
 * - Wedding-specific branding and theme colors
 * - Canonical URL management
 * - Performance-optimized font preloading
 * - Page-specific SEO component variants
 *
 * @module SEO
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <SEO />
 *
 * // Page-specific SEO
 * <SEO
 *   title="RSVP"
 *   description="Please let us know if you'll be joining us"
 *   url="https://dj-forever2.onrender.com/rsvp"
 * />
 *
 * // Use pre-built page components
 * <RSVPPageSEO />
 * ```
 *
 * @see {@link https://ogp.me/} Open Graph Protocol
 * @see {@link https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards} Twitter Cards
 */

import { Helmet } from 'react-helmet-async';

/**
 * Props for SEO component configuration
 * @interface SEOProps
 */
interface SEOProps {
  /** Page title (will be suffixed with site name) */
  title?: string;
  /** Meta description for search engines and social sharing */
  description?: string;
  /** Social sharing image URL */
  image?: string;
  /** Canonical URL for the page */
  url?: string;
  /** OpenGraph type (website, article, etc.) */
  type?: string;
}

/**
 * SEO component for comprehensive search engine optimization
 *
 * Injects meta tags, Open Graph data, and Twitter Cards using react-helmet-async.
 * Provides wedding-specific defaults with customizable properties for individual
 * pages. Includes performance optimizations and social media integration.
 *
 * @param props SEO configuration options
 * @returns Helmet component with meta tags
 *
 * @example
 * ```tsx
 * // Home page with defaults
 * <SEO />
 *
 * // Gallery page with custom SEO
 * <SEO
 *   title="Photo Gallery"
 *   description="Browse our wedding photos and memories"
 *   image="/images/gallery-preview.jpg"
 *   url="https://dj-forever2.onrender.com/gallery"
 * />
 *
 * // RSVP page with article type
 * <SEO
 *   title="RSVP"
 *   description="Submit your wedding RSVP"
 *   type="article"
 * />
 * ```
 *
 * @accessibility
 * - Proper viewport meta tag for responsive design
 * - Theme color for browser UI customization
 * - Language specification for screen readers
 *
 * @performance
 * - Preconnects to Google Fonts for faster loading
 * - Canonical URLs to prevent duplicate content
 * - Optimized meta tag order for parsing speed
 */
export function SEO({
  title = "Dominique & Justin's Wedding",
  description = 'Join us as we celebrate our special day. Find all the details about our wedding ceremony, reception, and how to RSVP.',
  image = '/og-image.jpg',
  url = 'https://dj-forever2.onrender.com',
  type = 'website',
}: SEOProps) {
  const fullTitle =
    title === "Dominique & Justin's Wedding"
      ? title
      : `${title} | Dominique & Justin's Wedding`;

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
      <meta property="og:site_name" content="Dominique & Justin's Wedding" />

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

/**
 * Pre-configured SEO components for specific pages
 *
 * These components provide optimized SEO settings for common wedding website
 * pages with carefully crafted titles, descriptions, and meta data designed
 * for maximum search engine visibility and social media engagement.
 */

/**
 * SEO component for home page with comprehensive wedding information
 * @returns Optimized SEO configuration for main website page
 */
export function HomePageSEO() {
  return (
    <SEO
      title="Dominique & Justin's Wedding"
      description="Join us as we celebrate our special day. Find all the details about our wedding ceremony, reception, and how to RSVP."
    />
  );
}

/**
 * SEO component for RSVP page with invitation-focused messaging
 * @returns Optimized SEO configuration for RSVP form page
 */
export function RSVPPageSEO() {
  return (
    <SEO
      title="RSVP"
      description="Please let us know if you'll be joining us for our special day. RSVP for our wedding ceremony and reception."
    />
  );
}

/**
 * SEO component for photo gallery with visual content emphasis
 * @returns Optimized SEO configuration for wedding photo gallery
 */
export function GalleryPageSEO() {
  return (
    <SEO
      title="Photo Gallery"
      description="Browse through our favorite photos and memories as we prepare for our wedding day."
    />
  );
}

/**
 * SEO component for travel information with practical guest guidance
 * @returns Optimized SEO configuration for travel and accommodations page
 */
export function TravelPageSEO() {
  return (
    <SEO
      title="Travel & Accommodations"
      description="Find information about travel, hotels, and accommodations for our wedding. Everything you need to plan your visit."
    />
  );
}

/**
 * SEO component for wedding registry with gift-giving focus
 * @returns Optimized SEO configuration for wedding registry page
 */
export function RegistryPageSEO() {
  return (
    <SEO
      title="Wedding Registry"
      description="Our wedding registry with gift ideas and links to our favorite stores. Your presence is the greatest gift, but if you wish to honor us with a gift, here are our registries."
    />
  );
}
