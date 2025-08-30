import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QRLoginModal from "./QRLoginModal";
import "../assets/styles.css";

// Links for the main page sections (hash links)
const sectionLinks = [
  { label: "Home", to: "home" },
  { label: "Our Story", to: "our-story" },
  { label: "The Details", to: "details" },
  { label: "Gallery", to: "gallery" },
  { label: "Travel Guide", to: "travel" },
  { label: "FAQs", to: "faqs" },
  { label: "Guestbook", to: "guestbook" },
];

// Links for standalone pages (router links)
const pageLinks = [
  { label: "Registry", to: "/registry" },
  { label: "RSVP", to: "/rsvp", requiresInvitation: true },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const location = useLocation();
  const [qrLoginModalOpen, setQrLoginModalOpen] = useState(false);
  const isHomePage = location.pathname === "/";

  // scroll listener for background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // detect active section on home page
  const [activeSection, setActiveSection] = useState("home");
  useEffect(() => {
    if (isHomePage) {
      const onScroll = () => {
        const pos = window.scrollY + 100;
        document.querySelectorAll("section[id]").forEach((sec) => {
          const el = sec as HTMLElement;
          if (pos >= el.offsetTop && pos < el.offsetTop + el.offsetHeight) {
            setActiveSection(el.id);
          }
        });
      };
      window.addEventListener("scroll", onScroll);
      onScroll();
      return () => window.removeEventListener("scroll", onScroll);
    }
  }, [isHomePage]);

  // close mobile menu on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (
        mobileMenuOpen &&
        !tgt.closest(".navbar-links") &&
        !tgt.closest(".navbar-mobile-toggle")
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileMenuOpen]);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">
        Dominique &amp; Justin
      </Link>

      <div
        className={`navbar-mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </div>

      <ul className={`navbar-links ${mobileMenuOpen ? "open" : ""}`}>
        {isHomePage ? (
          sectionLinks.map((link, i) => (
            <li
              key={link.to}
              style={{ "--item-index": i } as React.CSSProperties}
            >
              <a
                href={`#${link.to}`}
                onClick={() => setMobileMenuOpen(false)}
                className={activeSection === link.to ? "active" : ""}
              >
                {link.label}
              </a>
            </li>
          ))
        ) : (
          <li style={{ "--item-index": 0 } as React.CSSProperties}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={isHomePage ? "active" : ""}
            >
              Home
            </Link>
          </li>
        )}

        {pageLinks.map((link, idx) => {
          if (link.requiresInvitation && !user?.isInvited) return null;
          return (
            <li
              key={link.to}
              style={
                {
                  "--item-index": idx + (isHomePage ? sectionLinks.length : 1),
                } as React.CSSProperties
              }
            >
              <Link
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={location.pathname === link.to ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        {/* Auth buttons */}
        <li style={{ "--item-index": 1000 } as React.CSSProperties}>
          {!isLoggedIn ? (
            <button
              className="btn btn-login-prompt"
              onClick={() => setQrLoginModalOpen(true)}
              title="Scan your invitation QR code to access your account"
            >
              <span className="login-icon">📱</span>
              Login
            </button>
          ) : (
            <button className="btn btn-outline" onClick={logout}>
              Logout
            </button>
          )}
        </li>
      </ul>

      {mobileMenuOpen && (
        <div
          className="navbar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* QR Login Modal */}
      <QRLoginModal
        isOpen={qrLoginModalOpen}
        onClose={() => setQrLoginModalOpen(false)}
      />
    </nav>
  );
}

export default Navbar;
