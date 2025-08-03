import React, { useEffect } from "react";
import HeroBanner from "../components/HeroBanner";
import SectionDivider from "../components/SectionDivider";
import { HomePageSEO } from "../components/SEO";
import {
  LazyComponent,
  Gallery,
  TravelGuide,
} from "../components/LazyComponents";
import { analytics } from "../utils/analytics";
import { performanceMonitor } from "../utils/performance";
import theme from "../theme/theme";
import OurStory from "./OurStory";
import TheDetails from "./TheDetails";

import FAQs from "./FAQs";
import Registry from "./Registry";
import Guestbook from "./Guestbook";

const HomePage: React.FC = () => {
  // IntersectionObserver to fade in each .section-content
  useEffect(() => {
    const endTimer = performanceMonitor.trackComponentRender("HomePage");

    // Track homepage view
    analytics.trackPageView("homepage");

    // Track page load performance
    performanceMonitor.trackPageLoad("homepage");

    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".section-content").forEach((section) => {
      observer.observe(section);
    });

    // End performance timer
    endTimer();

    return () => {
      document.querySelectorAll(".section-content").forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      <HomePageSEO />
      {/* Hero Section */}
      <HeroBanner />

      {/* Our Story Section */}
      <section id="our-story">
        <h2 className="section-title">Our Story</h2>
        <div className="section-content">
          <OurStory />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* The Details Section */}
      <section id="details">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">The Details</h2>
        <div className="section-content">
          <TheDetails />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* Gallery Section */}
      <section id="gallery">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">Gallery</h2>
        <div className="section-content">
          <LazyComponent
            Component={Gallery}
            loadingMessage="Loading photo gallery..."
          />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* Travel Guide Section */}
      <section id="travel">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">Travel Guide</h2>
        <div className="section-content">
          <LazyComponent
            Component={TravelGuide}
            loadingMessage="Loading travel information..."
          />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* FAQs Section */}
      <section id="faqs">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">FAQs</h2>
        <div className="section-content">
          <FAQs />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* Registry Section */}
      <section id="registry">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">Registry</h2>
        <div className="section-content">
          <Registry />
        </div>
        <SectionDivider position="bottom" color={theme.colors.cream} />
      </section>

      {/* Guestbook Section */}
      <section id="guestbook">
        <SectionDivider position="top" color={theme.colors.cream} />
        <h2 className="section-title">Guestbook</h2>
        <div className="section-content">
          <Guestbook />
        </div>
      </section>
    </>
  );
};

export default HomePage;
