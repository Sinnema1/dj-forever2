import React, { useMemo, useState } from 'react';
import './AdminAnalytics.css';

interface Guest {
  fullName: string;
  hasRSVPed: boolean;
  isInvited: boolean;
  createdAt?: string;
  lastUpdated?: string;
  rsvp?: {
    attending: 'YES' | 'NO' | 'MAYBE';
    guestCount: number;
    guests: Array<{
      mealPreference: string;
      allergies?: string;
    }>;
  };
}

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

interface AdminAnalyticsProps {
  stats: AdminStats;
  guests: Guest[];
}

/**
 * Admin Analytics - Enhanced visualizations for wedding data.
 * Provides interactive charts, trends, and detailed insights.
 */
const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ stats, guests }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');

  // Calculate response timeline
  const responseTimeline = useMemo(() => {
    const rsvpedGuests = guests.filter(g => g.hasRSVPed && g.lastUpdated);

    if (rsvpedGuests.length === 0) return [];

    // Group by date
    const groupedByDate = rsvpedGuests.reduce(
      (acc, guest) => {
        if (!guest.lastUpdated) return acc;
        const date = new Date(guest.lastUpdated).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { attending: 0, notAttending: 0, maybe: 0 };
        }

        if (guest.rsvp?.attending === 'YES') acc[date].attending++;
        else if (guest.rsvp?.attending === 'NO') acc[date].notAttending++;
        else if (guest.rsvp?.attending === 'MAYBE') acc[date].maybe++;

        return acc;
      },
      {} as Record<
        string,
        { attending: number; notAttending: number; maybe: number }
      >
    );

    // Convert to array and sort by date
    const timeline = Object.entries(groupedByDate)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate cumulative totals
    let cumulativeAttending = 0;
    let cumulativeNotAttending = 0;
    let cumulativeMaybe = 0;

    return timeline.map(entry => {
      cumulativeAttending += entry.attending;
      cumulativeNotAttending += entry.notAttending;
      cumulativeMaybe += entry.maybe;
      return {
        ...entry,
        cumulativeAttending,
        cumulativeNotAttending,
        cumulativeMaybe,
        totalResponses:
          cumulativeAttending + cumulativeNotAttending + cumulativeMaybe,
      };
    });
  }, [guests]);

  // Calculate guest count distribution
  const guestCountDistribution = useMemo(() => {
    const distribution: Record<number, number> = {};

    guests.forEach(guest => {
      if (guest.hasRSVPed && guest.rsvp?.attending === 'YES') {
        const count = guest.rsvp.guestCount || 1;
        distribution[count] = (distribution[count] || 0) + 1;
      }
    });

    return Object.entries(distribution)
      .map(([count, parties]) => ({ count: parseInt(count), parties }))
      .sort((a, b) => a.count - b.count);
  }, [guests]);

  // Calculate meal preference breakdown with percentages
  const mealAnalysis = useMemo(() => {
    const totalMeals = stats.mealPreferences.reduce(
      (sum, m) => sum + m.count,
      0
    );
    return stats.mealPreferences.map(meal => ({
      ...meal,
      percentage: totalMeals > 0 ? (meal.count / totalMeals) * 100 : 0,
    }));
  }, [stats.mealPreferences]);

  // Calculate RSVP completion by day of week
  const dayOfWeekAnalysis = useMemo(() => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const byDay: Record<string, number> = {};

    guests.forEach(guest => {
      if (guest.hasRSVPed && guest.lastUpdated) {
        const dayIndex = new Date(guest.lastUpdated).getDay();
        const dayOfWeek = days[dayIndex];
        if (dayOfWeek) {
          byDay[dayOfWeek] = (byDay[dayOfWeek] || 0) + 1;
        }
      }
    });

    return days.map(day => ({ day, count: byDay[day] || 0 }));
  }, [guests]);

  // Calculate key insights
  const insights = useMemo(() => {
    const insights = [];

    // Response rate insight
    if (stats.rsvpPercentage >= 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Response Rate',
        description: `${stats.rsvpPercentage.toFixed(1)}% of invited guests have responded!`,
      });
    } else if (stats.rsvpPercentage < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Response Rate',
        description: `Only ${stats.rsvpPercentage.toFixed(1)}% have responded. Consider sending reminders.`,
      });
    }

    // Attendance rate insight
    const attendanceRate =
      stats.totalRSVPed > 0
        ? (stats.totalAttending / stats.totalRSVPed) * 100
        : 0;

    if (attendanceRate >= 90) {
      insights.push({
        type: 'success',
        title: 'High Attendance Expected',
        description: `${attendanceRate.toFixed(1)}% of respondents are attending!`,
      });
    }

    // Meal preference insight
    if (stats.mealPreferences.length > 0) {
      const topMeal = stats.mealPreferences.reduce((max, meal) =>
        meal.count > max.count ? meal : max
      );
      insights.push({
        type: 'info',
        title: 'Popular Meal Choice',
        description: `${topMeal.preference} is the most popular with ${topMeal.count} selections.`,
      });
    }

    // Dietary restrictions insight
    if (stats.dietaryRestrictions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Dietary Restrictions',
        description: `${stats.dietaryRestrictions.length} guests have special dietary needs.`,
      });
    }

    return insights;
  }, [stats]);

  const maxTimelineValue = Math.max(
    ...responseTimeline.map(t => t.totalResponses),
    1
  );

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h2>Analytics & Insights</h2>
        <div className="time-range-selector">
          <button
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'success' && '✓'}
                  {insight.type === 'warning' && '⚠️'}
                  {insight.type === 'info' && 'ℹ️'}
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP Response Timeline */}
      {responseTimeline.length > 0 && (
        <div className="analytics-section">
          <h3>Response Timeline</h3>
          <div className="chart-container timeline-chart">
            <div className="chart-y-axis">
              <span>{maxTimelineValue}</span>
              <span>{Math.floor(maxTimelineValue / 2)}</span>
              <span>0</span>
            </div>
            <div className="chart-content">
              {responseTimeline.map((entry, index) => (
                <div key={index} className="timeline-bar">
                  <div className="bar-stack">
                    <div
                      className="bar-segment attending"
                      style={{
                        height: `${(entry.cumulativeAttending / maxTimelineValue) * 100}%`,
                      }}
                      title={`Attending: ${entry.cumulativeAttending}`}
                    />
                    <div
                      className="bar-segment maybe"
                      style={{
                        height: `${(entry.cumulativeMaybe / maxTimelineValue) * 100}%`,
                      }}
                      title={`Maybe: ${entry.cumulativeMaybe}`}
                    />
                    <div
                      className="bar-segment not-attending"
                      style={{
                        height: `${(entry.cumulativeNotAttending / maxTimelineValue) * 100}%`,
                      }}
                      title={`Not Attending: ${entry.cumulativeNotAttending}`}
                    />
                  </div>
                  <div className="bar-label">{entry.date}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-color attending"></span> Attending
            </span>
            <span className="legend-item">
              <span className="legend-color maybe"></span> Maybe
            </span>
            <span className="legend-item">
              <span className="legend-color not-attending"></span> Not Attending
            </span>
          </div>
        </div>
      )}

      {/* Meal Preferences Pie Chart */}
      {mealAnalysis.length > 0 && (
        <div className="analytics-section">
          <h3>Meal Preferences Distribution (Attending Guests)</h3>
          <div className="chart-container meal-chart">
            <div className="pie-chart">
              {mealAnalysis.map((meal, index) => (
                <div
                  key={meal.preference}
                  className="pie-slice"
                  style={
                    {
                      '--slice-percentage': `${meal.percentage}%`,
                      '--slice-offset': `${mealAnalysis
                        .slice(0, index)
                        .reduce((sum, m) => sum + m.percentage, 0)}%`,
                    } as React.CSSProperties
                  }
                >
                  <span className="pie-label">
                    {meal.preference} ({meal.count})
                  </span>
                </div>
              ))}
            </div>
            <div className="meal-breakdown">
              {mealAnalysis.map(meal => (
                <div key={meal.preference} className="meal-stat">
                  <div className="meal-bar">
                    <div
                      className="meal-bar-fill"
                      style={{ width: `${meal.percentage}%` }}
                    />
                  </div>
                  <div className="meal-info">
                    <span className="meal-name">{meal.preference}</span>
                    <span className="meal-count">
                      {meal.count} ({meal.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guest Count Distribution */}
      {guestCountDistribution.length > 0 && (
        <div className="analytics-section">
          <h3>Party Size Distribution</h3>
          <div className="chart-container distribution-chart">
            {guestCountDistribution.map(item => (
              <div key={item.count} className="distribution-item">
                <div className="distribution-label">
                  {item.count} {item.count === 1 ? 'Guest' : 'Guests'}
                </div>
                <div className="distribution-bar">
                  <div
                    className="distribution-bar-fill"
                    style={{
                      width: `${(item.parties / Math.max(...guestCountDistribution.map(d => d.parties))) * 100}%`,
                    }}
                  />
                  <span className="distribution-count">
                    {item.parties} parties
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day of Week Analysis */}
      {dayOfWeekAnalysis.some(d => d.count > 0) && (
        <div className="analytics-section">
          <h3>Response Activity by Day of Week</h3>
          <div className="chart-container day-chart">
            {dayOfWeekAnalysis.map(day => (
              <div key={day.day} className="day-item">
                <div className="day-label">{day.day.substring(0, 3)}</div>
                <div className="day-bar">
                  <div
                    className="day-bar-fill"
                    style={{
                      height: `${(day.count / Math.max(...dayOfWeekAnalysis.map(d => d.count), 1)) * 100}%`,
                    }}
                  />
                  <span className="day-count">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="analytics-section summary-section">
        <h3>Summary Statistics</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{stats.totalAttending}</div>
            <div className="summary-label">Total Attending</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">
              {stats.totalRSVPed > 0
                ? ((stats.totalAttending / stats.totalRSVPed) * 100).toFixed(1)
                : '0'}
              %
            </div>
            <div className="summary-label">Attendance Rate</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">
              {guests.filter(g => g.isInvited && !g.hasRSVPed).length}
            </div>
            <div className="summary-label">Pending RSVPs</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{stats.totalMaybe}</div>
            <div className="summary-label">Maybe Responses</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
