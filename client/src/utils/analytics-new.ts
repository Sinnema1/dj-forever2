// Enhanced analytics for tracking guest engagement
interface AnalyticsEvent {
  event: string;
  guestId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class WeddingAnalytics {
  private events: AnalyticsEvent[] = [];

  track(event: string, guestId?: string, metadata?: Record<string, any>) {
    this.events.push({
      event,
      guestId,
      timestamp: new Date(),
      metadata,
    });

    // Send to backend or analytics service
    if (process.env.NODE_ENV === "production") {
      this.sendToBackend({ event, guestId, metadata });
    } else {
      console.log("📊 Analytics Event:", { event, guestId, metadata });
    }
  }

  private async sendToBackend(eventData: Omit<AnalyticsEvent, "timestamp">) {
    try {
      // Optional: Send analytics to your GraphQL backend
      // await fetch('/graphql', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     query: `mutation TrackEvent($input: AnalyticsEventInput!) {
      //       trackEvent(input: $input) { success }
      //     }`,
      //     variables: { input: eventData }
      //   })
      // });
    } catch (error) {
      console.warn("Failed to send analytics:", error);
    }
  }

  // Track common wedding website events
  trackPageView(page: string, guestId?: string) {
    this.track("page_view", guestId, { page });
  }

  trackRSVPStarted(guestId: string) {
    this.track("rsvp_started", guestId);
  }

  trackRSVPCompleted(guestId: string, attending: boolean) {
    this.track("rsvp_completed", guestId, { attending });
  }

  trackGalleryViewed(guestId?: string) {
    this.track("gallery_viewed", guestId);
  }

  trackQRLogin(guestId: string) {
    this.track("qr_login", guestId);
  }

  trackTimeSpent(page: string, timeSeconds: number, guestId?: string) {
    this.track("time_spent", guestId, { page, timeSeconds });
  }

  trackError(error: string, page: string, guestId?: string) {
    this.track("error_occurred", guestId, { error, page });
  }

  // Get analytics summary (for development/testing)
  getSummary() {
    return {
      totalEvents: this.events.length,
      uniqueGuests: new Set(this.events.map((e) => e.guestId).filter(Boolean))
        .size,
      eventTypes: Object.entries(
        this.events.reduce(
          (acc, e) => {
            acc[e.event] = (acc[e.event] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      ),
    };
  }
}

// Export singleton instance
export const analytics = new WeddingAnalytics();
