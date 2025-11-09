import React from 'react';
import './AdminStatsCard.css';

interface MealPreference {
  preference: string;
  count: number;
}

interface AdminStats {
  totalInvited: number;
  totalRSVPed: number;
  totalAttending: number;
  totalNotAttending: number;
  totalMaybe: number;
  rsvpPercentage: number;
  mealPreferences: MealPreference[];
  dietaryRestrictions: string[];
}

interface AdminStatsCardProps {
  stats: AdminStats;
}

/**
 * Admin Statistics Card - Visual representation of wedding statistics.
 * Displays key metrics including guest counts, RSVP rates, and meal preferences.
 */
const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ stats }) => {
  const rsvpRate = stats.rsvpPercentage.toFixed(1);
  const attendanceRate =
    stats.totalRSVPed > 0
      ? ((stats.totalAttending / stats.totalRSVPed) * 100).toFixed(1)
      : '0';

  return (
    <div className="admin-stats-card">
      <h2>Wedding Statistics</h2>

      <div className="stats-grid">
        <div
          className="stat-item primary"
          role="group"
          aria-label="Attending guests"
        >
          <div className="stat-number">{stats.totalAttending}</div>
          <div className="stat-label">Attending Guests</div>
        </div>

        <div className="stat-item" role="group" aria-label="RSVPs received">
          <div className="stat-number">{stats.totalRSVPed}</div>
          <div className="stat-label">RSVPs Received</div>
        </div>

        <div className="stat-item" role="group" aria-label="Maybe responses">
          <div className="stat-number">{stats.totalMaybe}</div>
          <div className="stat-label">Maybe Responses</div>
        </div>

        <div className="stat-item" role="group" aria-label="Total invited">
          <div className="stat-number">{stats.totalInvited}</div>
          <div className="stat-label">Total Invited</div>
        </div>
      </div>

      <div className="stats-rates">
        <div
          className="rate-item"
          role="group"
          aria-label={`RSVP rate ${rsvpRate} percent`}
        >
          <div className="rate-bar">
            <div
              className="rate-fill rsvp"
              style={{ width: `${rsvpRate}%` }}
              aria-hidden
            />
          </div>
          <div className="rate-label">RSVP Rate: {rsvpRate}%</div>
        </div>

        <div
          className="rate-item"
          role="group"
          aria-label={`Attendance rate ${attendanceRate} percent`}
        >
          <div className="rate-bar">
            <div
              className="rate-fill attendance"
              style={{ width: `${attendanceRate}%` }}
              aria-hidden
            />
          </div>
          <div className="rate-label">Attendance Rate: {attendanceRate}%</div>
        </div>
      </div>

      {stats.mealPreferences && stats.mealPreferences.length > 0 && (
        <div className="meal-preferences">
          <h3>Meal Preferences (Attending Guests Only)</h3>
          <div className="meal-grid">
            {stats.mealPreferences.map(meal => (
              <div key={meal.preference} className="meal-item">
                <div className="meal-count">{meal.count}</div>
                <div className="meal-type">{meal.preference}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.dietaryRestrictions && stats.dietaryRestrictions.length > 0 && (
        <div className="dietary-restrictions">
          <h3>Dietary Restrictions (Attending Guests Only)</h3>
          <div className="restrictions-list">
            {stats.dietaryRestrictions.map(restriction => (
              <div key={restriction} className="restriction-item">
                {restriction}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatsCard;
