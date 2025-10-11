import React from 'react';
import './AdminStatsCard.css';

interface MealPreference {
  mealType: string;
  count: number;
}

interface AdminStats {
  totalUsers: number;
  invitedUsers: number;
  rsvpedUsers: number;
  attendingUsers: number;
  totalGuests: number;
  attendingGuests: number;
  mealPreferences: MealPreference[];
}

interface AdminStatsCardProps {
  stats: AdminStats;
}

/**
 * Admin Statistics Card - Visual representation of wedding statistics.
 * Displays key metrics including guest counts, RSVP rates, and meal preferences.
 */
const AdminStatsCard: React.FC<AdminStatsCardProps> = ({ stats }) => {
  const rsvpRate =
    stats.invitedUsers > 0
      ? ((stats.rsvpedUsers / stats.invitedUsers) * 100).toFixed(1)
      : '0';
  const attendanceRate =
    stats.rsvpedUsers > 0
      ? ((stats.attendingUsers / stats.rsvpedUsers) * 100).toFixed(1)
      : '0';

  return (
    <div className="admin-stats-card">
      <h2>Wedding Statistics</h2>

      <div className="stats-grid">
        <div className="stat-item primary">
          <div className="stat-number">{stats.attendingGuests}</div>
          <div className="stat-label">Attending Guests</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{stats.attendingUsers}</div>
          <div className="stat-label">Attending Invitees</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{stats.rsvpedUsers}</div>
          <div className="stat-label">RSVPs Received</div>
        </div>

        <div className="stat-item">
          <div className="stat-number">{stats.invitedUsers}</div>
          <div className="stat-label">Total Invited</div>
        </div>
      </div>

      <div className="stats-rates">
        <div className="rate-item">
          <div className="rate-bar">
            <div
              className="rate-fill rsvp"
              style={{ width: `${rsvpRate}%` }}
            ></div>
          </div>
          <div className="rate-label">RSVP Rate: {rsvpRate}%</div>
        </div>

        <div className="rate-item">
          <div className="rate-bar">
            <div
              className="rate-fill attendance"
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
          <div className="rate-label">Attendance Rate: {attendanceRate}%</div>
        </div>
      </div>

      {stats.mealPreferences && stats.mealPreferences.length > 0 && (
        <div className="meal-preferences">
          <h3>Meal Preferences</h3>
          <div className="meal-grid">
            {stats.mealPreferences.map(meal => (
              <div key={meal.mealType} className="meal-item">
                <div className="meal-count">{meal.count}</div>
                <div className="meal-type">{meal.mealType}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatsCard;
