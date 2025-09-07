import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import QRLoginModal from "./QRLoginModal";
import MobileDrawer from "./MobileDrawer";

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
  const { user, isLoggedIn, isLoading, logout } = useAuth();
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

  // close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/" className="navbar-logo">
        Dominique &amp; Justin
      </Link>

      {/* Desktop Navigation */}
      <ul className="navbar-links desktop-nav">
        {isHomePage ? (
          sectionLinks.map((link) => (
            <li key={link.to}>
              <a
                href={`#${link.to}`}
                className={activeSection === link.to ? "active" : ""}
              >
                {link.label}
              </a>
            </li>
          ))
        ) : (
          <li>
            <Link to="/" className={isHomePage ? "active" : ""}>
              Home
            </Link>
          </li>
        )}

        {pageLinks.map((link) => {
          if (link.requiresInvitation && !user?.isInvited) return null;
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        {/* Desktop Auth Button */}
        <li>
          {isLoading ? (
            <div className="btn btn-login-prompt" style={{ opacity: 0.6 }}>
              <span className="login-icon">⏳</span>
              Loading...
            </div>
          ) : !isLoggedIn ? (
            <button
              className="btn btn-login-prompt"
              onClick={() => setQrLoginModalOpen(true)}
              title="Scan your invitation QR code to access your account"
            >
              <span className="login-icon">📱</span>
              Login
            </button>
          ) : (
            <div className="desktop-user-info">
              <span className="user-greeting">
                Hello,{" "}
                {user && user.fullName ? user.fullName.split(" ")[0] : "Guest"}!
              </span>
              <button className="btn btn-outline" onClick={() => logout()}>
                Logout
              </button>
            </div>
          )}
        </li>
      </ul>

      {/* Mobile Menu Toggle */}
      <button
        className={`navbar-mobile-toggle ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {/* Modern Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="navbar-drawer"
      >
        <ul className="drawer-nav" id="mobile-navigation">
          {/* Navigation Links */}
          {isHomePage ? (
            sectionLinks.map((link, i) => (
              <li
                key={link.to}
                style={{ "--item-index": i } as React.CSSProperties}
              >
                <a
                  href={`#${link.to}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`drawer-link ${activeSection === link.to ? "active" : ""}`}
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
                className={`drawer-link ${isHomePage ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
          )}

          {pageLinks.map((link, idx) => {
            if (link.requiresInvitation && !user?.isInvited) return null;
            const itemIndex = idx + (isHomePage ? sectionLinks.length : 1);
            return (
              <li
                key={link.to}
                style={{ "--item-index": itemIndex } as React.CSSProperties}
              >
                <Link
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`drawer-link ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {/* Divider */}
          <div
            className="drawer-divider"
            style={{ "--item-index": 10 } as React.CSSProperties}
          />
        </ul>

        {/* Auth Section */}
        <div className="drawer-auth-section">
          {isLoading ? (
            <button className="drawer-auth-button" disabled>
              <span className="login-icon">⏳</span>
              Loading...
            </button>
          ) : !isLoggedIn ? (
            <button
              className="drawer-auth-button"
              onClick={() => {
                setQrLoginModalOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              <span className="login-icon">📱</span>
              Login with QR Code
            </button>
          ) : (
            <>
              <div className="drawer-user-greeting">
                Hello,{" "}
                {user && user.fullName ? user.fullName.split(" ")[0] : "Guest"}!
              </div>
              <button
                className="drawer-auth-button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </MobileDrawer>

      {/* QR Login Modal */}
      <QRLoginModal
        isOpen={qrLoginModalOpen}
        onClose={() => setQrLoginModalOpen(false)}
        onLoginSuccess={() => {
          setQrLoginModalOpen(false);
          // Optionally reload or redirect after successful login
        }}
      />
    </nav>
  );
}

export default Navbar;
