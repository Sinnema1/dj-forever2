/**
 * Feature Flag Configuration for DJ Forever 2
 *
 * Centralized feature toggles for controlling application features.
 * Features can be enabled/disabled via environment variables without code changes.
 *
 * @example
 * // In .env file:
 * VITE_ENABLE_MEAL_PREFERENCES=true
 *
 * @example
 * // In component:
 * import { features } from '../config/features';
 * if (features.mealPreferencesEnabled) {
 *   // Show meal selection UI
 * }
 */

export const features = {
  /**
   * Meal Preferences Feature
   *
   * Controls whether meal selection is available in the RSVP form.
   * When disabled, guests will see a "coming soon" message instead of meal options.
   *
   * @default false (disabled until menu is finalized)
   * @env VITE_ENABLE_MEAL_PREFERENCES
   */
  mealPreferencesEnabled:
    import.meta.env.VITE_ENABLE_MEAL_PREFERENCES === 'true',
};
