import './MealPreferencesComingSoon.css';

/**
 * MealPreferencesComingSoon - Dinner menu summary banner
 *
 * Displays when meal preferences feature is disabled in the current environment.
 * Shows the finalized dinner menu so guests know what to expect even when
 * meal selection is not yet enabled.
 */
export default function MealPreferencesComingSoon() {
  return (
    <div className="meal-preferences-coming-soon">
      <div className="coming-soon-icon" aria-hidden="true">
        🍽️
      </div>
      <h3 className="coming-soon-title">Dinner Menu</h3>
      <p className="coming-soon-description">
        Our dinner menu is finalized! When meal selection opens, each guest will
        choose one entree.
      </p>
      <div className="coming-soon-features">
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            🥩
          </span>
          <span className="feature-text">
            BBQ Beef Brisket with chipotle honey BBQ sauce
          </span>
        </div>
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            🥩
          </span>
          <span className="feature-text">
            Carved Tri Tip with chimichurri, horseradish cream, or au jus
          </span>
        </div>
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            🧒
          </span>
          <span className="feature-text">
            Kids Menu (ages 3-12): Chicken Tenders or Macaroni and Cheese with
            fries, fruit, and a juice box
          </span>
        </div>
        <div className="feature-item">
          <span className="feature-icon" aria-hidden="true">
            🥗
          </span>
          <span className="feature-text">
            Shared for everyone: Field of Greens, Roasted Garlic Mashed
            Potatoes, and Glazed Carrots
          </span>
        </div>
      </div>
      <p className="coming-soon-note">
        <strong>Note:</strong> Dietary accommodations will be available. Please
        include any food allergies or dietary restrictions in the fields below.
      </p>
    </div>
  );
}
