/**
 * Enhanced smooth scroll utility with offset support for fixed navbar
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
    console.warn(`Element with ID "${targetId}" not found for smooth scroll`);
    return;
  }

  // Calculate the element's position relative to the document
  const elementPosition = el.getBoundingClientRect().top + window.scrollY;

  // Calculate final scroll position with offset for fixed navbar
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
