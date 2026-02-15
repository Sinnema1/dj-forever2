import './MealPreferencesComingSoon.css';

/**
 * MealPreferencesComingSoon - Placeholder banner for meal selection feature
 *
 * Displays when meal preferences feature is disabled (before menu is finalized).
 * Provides clear communication about when meal selection will be available.
 */
export default function MealPreferencesComingSoon() {
  return (
    <div className="meal-preferences-coming-soon">
      <div className="coming-soon-icon" aria-hidden="true">
        🍽️
      </div>
      <h3 className="coming-soon-title">Menu Selection Coming in April</h3>
      <p className="coming-soon-description">
        We're finalizing our delicious menu options and will notify you when
        meal selection becomes available. You'll be able to choose your
        preferences before the big day!
      </p>
      <div className="coming-soon-features">
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            ✉️
          </span>
          <span className="feature-text">Email notification when ready</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            🌱
          </span>
          <span className="feature-text">
            Vegetarian, vegan, and dietary options
          </span>
        </div>
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            👶
          </span>
          <span className="feature-text">Kids menu available</span>
        </div>
      </div>
      <p className="coming-soon-note">
        <strong>Note:</strong> Please include any food allergies or dietary
        restrictions in the fields below so we can accommodate your needs.
      </p>
    </div>
  );
}
