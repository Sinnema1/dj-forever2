import React, {
  useEffect,
  useRef,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';

/**
 * Props interface for MobileDrawer component
 */
interface MobileDrawerProps {
  /** Whether the drawer is open/visible */
  isOpen: boolean;
  /** Callback function to close the drawer */
  onClose: () => void;
  /** Content to render inside the drawer */
  children: ReactNode;
  /** Optional CSS class name for styling customization */
  className?: string;
}

/**
 * Ref handle for MobileDrawer
 */
export interface MobileDrawerHandle {
  skipScrollRestoreRef: React.MutableRefObject<boolean>;
}

/**
 * MobileDrawer - Accessible Mobile Navigation Drawer
 *
 * A modern, accessible mobile drawer component that slides in from the side.
 * Follows WCAG 2.1 AA accessibility standards with proper focus management,
 * keyboard navigation, and screen reader support.
 *
 * @features
 * - **Accessibility**: Full WCAG 2.1 AA compliance with ARIA attributes
 * - **Focus Management**: Automatic focus trapping and restoration
 * - **Keyboard Navigation**: Tab cycling and Escape key support
 * - **Body Scroll Lock**: Prevents background scrolling when open
 * - **Portal Rendering**: Renders outside component hierarchy for proper z-index
 * - **Touch Interactions**: Backdrop tap to close functionality
 * - **Screen Reader Support**: Proper semantic markup and labels
 *
 * @example
 * ```tsx
 * // Basic usage
 * <MobileDrawer isOpen={isMenuOpen} onClose={closeMenu}>
 *   <nav>
 *     <a href="/home">Home</a>
 *     <a href="/about">About</a>
 *     <a href="/contact">Contact</a>
 *   </nav>
 * </MobileDrawer>
 *
 * // With custom styling
 * <MobileDrawer
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   className="custom-drawer-style"
 * >
 *   <NavigationMenu />
 * </MobileDrawer>
 * ```
 */
const MobileDrawer = forwardRef<MobileDrawerHandle, MobileDrawerProps>(
  ({ isOpen, onClose, children, className = '' }, ref) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const previousActiveElementRef = useRef<Element | null>(null);
    const skipScrollRestoreRef = useRef(false);

    // Expose the ref to parent
    useImperativeHandle(ref, () => ({
      skipScrollRestoreRef,
    }));

    // Focus management
    useEffect(() => {
      if (isOpen) {
        // Store the currently focused element
        previousActiveElementRef.current = document.activeElement;

        // Focus the drawer after it opens
        setTimeout(() => {
          drawerRef.current?.focus();
        }, 100);
      } else {
        // Restore focus when closing
        if (previousActiveElementRef.current) {
          (previousActiveElementRef.current as HTMLElement)?.focus();
        }
      }
    }, [isOpen]);

    // Body scroll lock - use overflow:hidden to prevent scroll without visual jump
    useEffect(() => {
      if (!isOpen) {
        return;
      }

      // Save current scroll position and prevent body scrolling
      const scrollY = window.scrollY;

      // Use overflow:hidden instead of position:fixed to avoid visual jump
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent scrollbar shift
      document.body.dataset.scrollY = scrollY.toString();

      return () => {
        // Remove overflow lock
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        delete document.body.dataset.scrollY;
        // Reset the ref for next time
        skipScrollRestoreRef.current = false;
      };
    }, [isOpen]);

    // Keyboard event handling
    useEffect(() => {
      if (!isOpen) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        // Close on Escape
        if (event.key === 'Escape') {
          onClose();
          return;
        }

        // Focus trap
        if (event.key === 'Tab' && drawerRef.current) {
          const focusableElements = drawerRef.current.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              event.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              event.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) {
      return null;
    }

    return createPortal(
      <div className="mobile-drawer-portal">
        {/* Backdrop */}
        <div
          ref={backdropRef}
          className="mobile-drawer-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer */}
        <nav
          ref={drawerRef}
          className={`mobile-drawer ${className}`}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
        >
          <div className="mobile-drawer-content">{children}</div>
        </nav>
      </div>,
      document.body
    );
  }
);

MobileDrawer.displayName = 'MobileDrawer';

export default MobileDrawer;
