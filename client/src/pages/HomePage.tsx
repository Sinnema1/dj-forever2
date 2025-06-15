import React, { useEffect } from "react";
import HeroBanner from "../components/HeroBanner";
import SectionDivider from "../components/SectionDivider";
import Home from "./Home";
import OurStory from "./OurStory";
import TheDetails from "./TheDetails";
import Gallery from "./Gallery";
import WeddingParty from "./WeddingParty";
import TravelGuide from "./TravelGuide";
import FAQs from "./FAQs";
import Registry from "./Registry";
import Guestbook from "./Guestbook";

const HomePage: React.FC = () => {
  // Add animation to sections when they come into view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
          // Stop observing after animation is applied
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all section content elements
    document.querySelectorAll(".section-content").forEach((section) => {
      observer.observe(section);
    });

    return () => {
      // Clean up
      document.querySelectorAll(".section-content").forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <HeroBanner />
      
      {/* Our Story Section */}
      <section id="our-story">
        <h2 className="section-title">Our Story</h2>
        <div className="section-content">
          <OurStory />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* The Details Section */}
      <section id="details">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">The Details</h2>
        <div className="section-content">
          <TheDetails />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* Gallery Section */}
      <section id="gallery">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">Gallery</h2>
        <div className="section-content">
          <Gallery />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* Wedding Party Section */}
      <section id="wedding-party">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">Wedding Party</h2>
        <div className="section-content">
          <WeddingParty />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* Travel Guide Section */}
      <section id="travel">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">Travel Guide</h2>
        <div className="section-content">
          <TravelGuide />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* FAQs Section */}
      <section id="faqs">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">FAQs</h2>
        <div className="section-content">
          <FAQs />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* Registry Section */}
      <section id="registry">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">Registry</h2>
        <div className="section-content">
          <Registry />
        </div>
        <SectionDivider position="bottom" color="#fff" />
      </section>
      
      {/* Guestbook Section */}
      <section id="guestbook">
        <SectionDivider position="top" color="#faf6f0" />
        <h2 className="section-title">Guestbook</h2>
        <div className="section-content">
          <Guestbook />
        </div>
      </section>
    </>
  );
};

export default HomePage;
