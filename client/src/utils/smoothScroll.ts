/**
 * Enhanced smooth scroll utility with offset support for fixed navbar
 *
 * iOS Safari 12/13 compatibility:
 * - Avoid ScrollToOptions overload of window.scrollTo({...})
 * - Use numeric overload universally
 * - Use requestAnimationFrame for smooth scrolling when supported
 */

function supportsNativeSmoothScroll(): boolean {
  // Old Safari (incl iOS 12/13) does not support scrollBehavior reliably
  return 'scrollBehavior' in document.documentElement.style;
}

function scrollToY(y: number, smooth: boolean) {
  const clampedY = Math.max(0, Math.floor(y));

  // Prefer native smooth when available without using scrollTo options object.
  if (smooth && supportsNativeSmoothScroll()) {
    // Use requestAnimationFrame incremental animation.
    const startY = window.scrollY;
    const delta = clampedY - startY;
    const durationMs = 420;
    const start = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, startY + delta * eased); // numeric overload (universal)
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    return;
  }

  // Instant jump (universal)
  window.scrollTo(0, clampedY);
}

/**
 * Scroll to a target element id.
 *
 * @param targetId - The ID of the element to scroll to (without #)
 * @param offset - Additional offset in pixels (default: navbar height + spacing)
 *
 * @example
 * ```typescript
 * // Scroll to a section with default navbar offset
 * smoothScroll('our-story');
 *
 * // Scroll with custom offset
 * smoothScroll('rsvp', 120);
 * ```
 */
export function smoothScroll(targetId: string, offset: number = 100) {
  const el = document.getElementById(targetId);
  if (!el) {
    console.warn(`[smoothScroll] Element with ID "${targetId}" not found`);
    return;
  }

  const elementY = el.getBoundingClientRect().top + window.scrollY;
  const targetY = elementY - offset;

  scrollToY(targetY, true);

  // Move focus for accessibility without extra scrolling
  // (prevents "lost" focus after skip links / drawer actions)
  if (typeof (el as HTMLElement).focus === 'function') {
    (el as HTMLElement).setAttribute('tabindex', '-1');
    (el as HTMLElement).focus({ preventScroll: true } as any);
  }
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop() {
  scrollToY(0, true);
}
