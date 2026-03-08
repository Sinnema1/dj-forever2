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
 * // In .env.local (local dev) or Render environment variables (production):
 * VITE_CRATE_BARREL_REGISTRY_URL=https://www.crateandbarrel.com/gift-registry/...
 * VITE_ZOLA_REGISTRY_URL=https://www.zola.com/registry/...
 * VITE_WEDDING_CONTACT_EMAIL=dj@ourwedding.com
 *
 * @example
 * // In component:
 * import { PUBLIC_LINKS } from '../config/publicLinks';
 * if (PUBLIC_LINKS.contactEmail) {
 *   // render mailto link
 * }
 */

const env = (value: string | undefined): string => value?.trim() ?? '';

export const PUBLIC_LINKS = {
  /** Guest-facing registry URLs — omit the env var to hide the card */
  registry: {
    crateAndBarrel: env(import.meta.env.VITE_CRATE_BARREL_REGISTRY_URL),
    zola: env(import.meta.env.VITE_ZOLA_REGISTRY_URL),
  },

  /** Wedding contact email for help pages and modals */
  contactEmail: env(import.meta.env.VITE_WEDDING_CONTACT_EMAIL),
} as const;
