/**
 * @fileoverview Responsive navigation component for wedding website
 *
 * Comprehensive navigation system with mobile-first design, authentication
 * integration, and dynamic section highlighting. Features responsive drawer
 * navigation, QR code login integration, and intelligent route management
 * with guest access controls.
 *
 * Features:
 * - Responsive design with desktop nav and mobile drawer
 * - QR code authentication integration
 * - Dynamic section highlighting on scroll
 * - Guest access control for protected routes
 * - Smooth scroll behavior for section navigation
 * - Modern mobile drawer with animations
 * - Authentication state management
 * - Accessible navigation with ARIA attributes
 *
 * @module Navbar
 * @version 2.0.0
 * @author DJ Forever Wedding Team
 * @since 1.0.0
 *
 * @example\n * ```typescript\n * // Navbar is automatically included in App.tsx\n * // Navigation automatically adapts based on:\n * // - User authentication state\n * // - Current route (home vs standalone pages) \n * // - Guest invitation status\n * // - Mobile vs desktop viewport\n * ```
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/menubar/} ARIA Navigation Pattern
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { smoothScroll, scrollToTop } from '../utils/smoothScroll';
import QRLoginModal from './QRLoginModal';
import MobileDrawer, { type MobileDrawerHandle } from './MobileDrawer';

/**
 * Interface for navigation link configuration
 */
interface NavigationLink {
  label: string;
  to: string;
  requiresInvitation?: boolean;
  requiresAdmin?: boolean;
}

/**
 * Navigation links for home page sections (hash-based navigation)
 * These links use smooth scrolling to navigate within the main page
 */
const sectionLinks = [
  { label: 'Home', to: 'home' },
  { label: 'Our Story', to: 'our-story' },
  { label: 'The Details', to: 'details' },
  { label: 'Gallery', to: 'gallery' },
  { label: 'Travel Guide', to: 'travel' },
  { label: 'FAQs', to: 'faqs' },
];

/**
 * Navigation links for standalone pages (React Router based)
 * These links navigate to separate pages with full page loads
 */
const pageLinks: NavigationLink[] = [
  { label: 'Registry', to: '/registry' },
  { label: 'RSVP', to: '/rsvp', requiresInvitation: true },
  { label: 'Admin', to: '/admin', requiresAdmin: true },
];

/**
 * Responsive navigation component with authentication and mobile support
 *
 * Provides comprehensive navigation for wedding website with adaptive behavior
 * based on route, authentication state, and viewport size. Includes QR login
 * integration, smooth section scrolling, and mobile drawer navigation.
 *
 * @component
 * @returns JSX element containing the complete navigation system
 *
 * @example\n * ```typescript\n * // Automatically handles different navigation modes:\n * \n * // Home page: Shows section links with active highlighting\n * // - Smooth scrolls to sections on same page\n * // - Highlights current section based on scroll position\n * \n * // Other pages: Shows \"Home\" link to return to main page\n * // - React Router navigation for standalone pages\n * \n * // Authentication states:\n * // - Loading: Shows loading spinner\n * // - Not logged in: Shows QR login button\n * // - Logged in: Shows user greeting and logout\n * \n * // Mobile behavior:\n * // - Hamburger menu toggles mobile drawer\n * // - Touch-friendly navigation with animations\n * // - Automatic menu closure on route changes\n * ```
 *
 * @features
 * - **Responsive Design**: Desktop navbar + mobile drawer
 * - **Authentication**: QR login modal integration
 * - **Section Highlighting**: Active section detection on scroll
 * - **Access Control**: RSVP link only for invited guests
 * - **Mobile UX**: Touch-optimized drawer with smooth animations
 * - **Accessibility**: ARIA labels and keyboard navigation support
 *
 * @dependencies
 * - `useAuth` - Authentication context for user state
 * - `useLocation` - React Router for route detection
 * - `QRLoginModal` - QR code authentication modal
 * - `MobileDrawer` - Mobile navigation drawer component
 */
function Navbar() {
  /** Navbar background state based on scroll position */
  const [scrolled, setScrolled] = useState(false);
  /** Mobile drawer open/closed state */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** Reference to MobileDrawer for controlling skip behavior */
  const mobileDrawerRef = useRef<MobileDrawerHandle>(null);
  /** Reference to navbar element for height measurement */
  const navRef = useRef<HTMLElement | null>(null);
  /** Authentication context for user state management */
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  /** Current route location for navigation state */
  const location = useLocation();
  /** QR login modal visibility state */
  const [qrLoginModalOpen, setQrLoginModalOpen] = useState(false);
  /** Flag indicating if current page is home page */
  const isHomePage = location.pathname === '/';

  /**
   * Measure actual navbar height and set CSS variable
   * Eliminates hardcoded height assumptions and prevents banner overlap
   */
  useEffect(() => {
    const el = navRef.current;
    if (!el) {
      return;
    }

    const setNavHeight = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--nav-h', `${h}px`);
    };

    setNavHeight();

    const ro = new ResizeObserver(() => setNavHeight());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  /**
   * Scroll listener for navbar background transparency effect
   * Updates navbar styling based on scroll position for visual hierarchy
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    handleScroll(); // Initial call
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Active section detection for navigation highlighting
   * Tracks which section is currently in view and updates navigation state
   */
  const [activeSection, setActiveSection] = useState('home');
  useEffect(() => {
    if (!isHomePage) {
      return undefined;
    }

    const updateActiveSection = () => {
      // Add navbar offset to current scroll position for section detection
      const scrollWithOffset = window.scrollY + 150;

      let foundSection = 'home';
      document.querySelectorAll('section[id]').forEach(sec => {
        const el = sec as HTMLElement;
        const sectionTop = el.offsetTop;
        const sectionBottom = sectionTop + el.offsetHeight;

        // Check if scroll position (with offset) is within this section
        if (
          scrollWithOffset >= sectionTop &&
          scrollWithOffset < sectionBottom
        ) {
          foundSection = el.id;
        }
      });

      setActiveSection(foundSection);
    };

    // Throttle scroll event for performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveSection(); // Initial call

    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]);

  /**
   * Automatically close mobile menu when navigating to different pages
   * Improves UX by preventing stuck open mobile menus after navigation
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Handle logo click - scroll to top if already on homepage
   */
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHomePage) {
      e.preventDefault();
      scrollToTop(); // Use iOS-safe utility
    }
    // Otherwise, let React Router handle navigation to "/"
  };

  const standalonePaths = ['/rsvp', '/registry', '/admin'];
  const isStandalone = standalonePaths.some(
    p => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  return (
    <nav
      ref={navRef}
      id="navigation"
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isStandalone ? 'navbar-standalone' : ''}`}
      aria-label="Main navigation"
    >
      <Link to="/" className="navbar-logo" onClick={handleLogoClick}>
        Dominique & Justin
      </Link>

      {/* Desktop Navigation */}
      <ul className="navbar-links desktop-nav">
        {isHomePage ? (
          sectionLinks.map(link => (
            <li key={link.to}>
              <a
                href={`#${link.to}`}
                className={activeSection === link.to ? 'active' : ''}
                onClick={e => {
                  e.preventDefault();
                  setActiveSection(link.to);
                  smoothScroll(link.to);
                }}
              >
                {link.label}
              </a>
            </li>
          ))
        ) : (
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
        )}

        {pageLinks.map(link => {
          if (link.requiresInvitation && !user?.isInvited) {
            return null;
          }
          if (link.requiresAdmin && !user?.isAdmin) {
            return null;
          }
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`${location.pathname === link.to ? 'active' : ''} ${link.label === 'RSVP' ? 'nav-cta' : ''}`}
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
              <span
                className="user-greeting"
                onClick={() =>
                  window.dispatchEvent(new Event('openWelcomeModal'))
                }
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('openWelcomeModal'));
                  }
                }}
                title="View your personalized welcome message"
              >
                Hello,{' '}
                {user && user.fullName ? user.fullName.split(' ')[0] : 'Guest'}!
                {user?.isAdmin && <span className="admin-badge">ADMIN</span>}
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
        className={`navbar-mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
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
        ref={mobileDrawerRef}
        isOpen={mobileMenuOpen}
        onClose={() => {
          console.log('[Navbar] Drawer onClose called');
          setMobileMenuOpen(false);
        }}
        className="navbar-drawer"
      >
        <ul className="drawer-nav" id="mobile-navigation">
          {/* Navigation Links */}
          {isHomePage ? (
            sectionLinks.map((link, i) => (
              <li
                key={link.to}
                style={{ '--item-index': i } as React.CSSProperties}
              >
                <a
                  href={`#${link.to}`}
                  onClick={e => {
                    e.preventDefault();

                    // Immediately set active section to the clicked link
                    setActiveSection(link.to);

                    // Set the ref flag to skip scroll restore on drawer close
                    if (mobileDrawerRef.current) {
                      mobileDrawerRef.current.skipScrollRestoreRef.current =
                        true;
                    }
                    setMobileMenuOpen(false);

                    // Schedule smooth scroll after drawer close animation completes
                    setTimeout(() => {
                      smoothScroll(link.to);
                    }, 350); // Wait for drawer slide-out animation (300ms) + small buffer
                  }}
                  className={`drawer-link ${activeSection === link.to ? 'active' : ''}`}
                >
                  {link.label}
                </a>
              </li>
            ))
          ) : (
            <li style={{ '--item-index': 0 } as React.CSSProperties}>
              <Link
                to="/"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                className={`drawer-link ${isHomePage ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
          )}

          {pageLinks.map((link, idx) => {
            if (link.requiresInvitation && !user?.isInvited) {
              return null;
            }
            if (link.requiresAdmin && !user?.isAdmin) {
              return null;
            }
            const itemIndex = idx + (isHomePage ? sectionLinks.length : 1);
            return (
              <li
                key={link.to}
                style={{ '--item-index': itemIndex } as React.CSSProperties}
              >
                <Link
                  to={link.to}
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                  className={`drawer-link ${location.pathname === link.to ? 'active' : ''} ${link.label === 'RSVP' ? 'nav-cta' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}

          {/* Divider */}
          <li
            role="separator"
            aria-hidden="true"
            style={{ '--item-index': 10 } as React.CSSProperties}
          >
            <div className="drawer-divider" />
          </li>
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
              <div
                className="drawer-user-greeting"
                onClick={() => {
                  window.dispatchEvent(new Event('openWelcomeModal'));
                  setMobileMenuOpen(false);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.dispatchEvent(new Event('openWelcomeModal'));
                    setMobileMenuOpen(false);
                  }
                }}
              >
                Hello,{' '}
                {user && user.fullName ? user.fullName.split(' ')[0] : 'Guest'}!
                {user?.isAdmin && <span className="admin-badge">ADMIN</span>}
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
