/**
 * Public Links Configuration for DJ Forever 2
 *
 * Centralizes all guest-facing URLs and contact information.
 * Values are read from environment variables so they can be configured
 * per deployment without code changes.
 *
 * When a value is not configured (empty string), consumer components
 * should gracefully degrade — e.g., hide the registry card or show
 * a fallback message instead of a broken mailto link.
 *
 * @example
 * // In .env file:
 * VITE_WEDDING_CONTACT_EMAIL=dj@ourwedding.com
 * VITE_REGISTRY_URL=https://www.crateandbarrel.com/gift-registry/your-name
 *
 * @example
 * // In component:
 * import { PUBLIC_LINKS } from '../config/publicLinks';
 * if (PUBLIC_LINKS.contactEmail) {
 *   // render mailto link
 * }
 */

export const PUBLIC_LINKS = {
  /** Guest-facing registry URLs — omit the env var to hide the card */
  registry: {
    crateAndBarrel: import.meta.env.VITE_CRATE_BARREL_REGISTRY_URL ?? '',
    williamsSonoma: import.meta.env.VITE_WILLIAMS_SONOMA_REGISTRY_URL ?? '',
    costco: import.meta.env.VITE_COSTCO_REGISTRY_URL ?? '',
    honeymoon: import.meta.env.VITE_HONEYMOON_FUND_URL ?? '',
  },

  /** Wedding contact email for help pages and modals */
  contactEmail: import.meta.env.VITE_WEDDING_CONTACT_EMAIL ?? '',
} as const;
