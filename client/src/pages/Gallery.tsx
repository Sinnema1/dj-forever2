import { useState, useEffect, useDeferredValue, useMemo } from 'react';
// Styles now imported globally via main.tsx
import SwipeableLightbox from '../components/SwipeableLightbox';
import LazyImage from '../components/LazyImage';
import { analytics } from '../utils/analytics';

// Enhanced image data with metadata for search functionality
interface ImageData {
  url: string;
  alt: string;
  keywords: string[];
  category: string;
}

const rawImages = Object.values(
  import.meta.glob('../assets/images/gallery/*.{png,jpg,jpeg,svg}', {
    eager: true,
    as: 'url',
  })
) as string[];

// Enhanced image metadata for search and filtering
const images: ImageData[] = rawImages.map((url, idx) => {
  const filename = url.split('/').pop()?.toLowerCase() || '';

  // Generate keywords and categories based on filename patterns
  let keywords: string[] = [];
  let category = 'moments';

  if (filename.includes('engagement') || filename.includes('proposal')) {
    keywords = ['engagement', 'proposal', 'romance', 'ring', 'surprise'];
    category = 'engagement';
  } else if (filename.includes('couple') || filename.includes('portrait')) {
    keywords = ['couple', 'portrait', 'together', 'love', 'romantic'];
    category = 'couple';
  } else if (filename.includes('family') || filename.includes('group')) {
    keywords = ['family', 'group', 'together', 'celebration', 'gathering'];
    category = 'family';
  } else if (filename.includes('venue') || filename.includes('location')) {
    keywords = ['venue', 'location', 'ceremony', 'reception', 'decorations'];
    category = 'venue';
  } else if (filename.includes('ring') || filename.includes('detail')) {
    keywords = ['rings', 'details', 'wedding', 'jewelry', 'close-up'];
    category = 'details';
  } else if (filename.includes('nature') || filename.includes('outdoor')) {
    keywords = ['nature', 'outdoor', 'landscape', 'scenery', 'beautiful'];
    category = 'nature';
  } else {
    keywords = ['wedding', 'celebration', 'love', 'joy', 'memory'];
  }

  return {
    url,
    alt: `Wedding gallery image ${idx + 1} - ${category}`,
    keywords,
    category,
  };
});

/**
 * Gallery - Enhanced Photo Gallery with React 18+ Search
 *
 * Wedding photo gallery with advanced search and filtering capabilities
 * using React 18+ concurrent features including useDeferredValue for
 * optimal performance during high-frequency search input updates.
 *
 * @features
 * - **React 18+ Concurrent Search**: useDeferredValue for non-blocking search
 * - **Smart Filtering**: Keywords and category-based image filtering
 * - **Performance Optimized**: Memoized search results and lazy loading
 * - **Enhanced UX**: Real-time search with responsive performance
 * - **Accessibility**: Proper ARIA labels and keyboard navigation
 *
 * @component
 */
export default function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * React 18+ useDeferredValue Hook for Concurrent Search Implementation
   *
   * Implements non-blocking search functionality using React 18's concurrent
   * rendering capabilities. This prevents UI freezing during rapid typing by
   * deferring expensive search operations while keeping the search input
   * immediately responsive to user input.
   *
   * @hook useDeferredValue
   * @param {string} searchQuery - The immediate search input value
   * @returns {string} deferredSearchQuery - Deferred version of search query
   *
   * @example
   * ```tsx
   * // Immediate input update (high priority)
   * const handleSearchInput = (value) => setSearchQuery(value);
   *
   * // Deferred filtering (low priority, non-blocking)
   * const filtered = useMemo(() =>
   *   filterImages(deferredSearchQuery), [deferredSearchQuery]
   * );
   * ```
   *
   * @benefits
   * - **Responsive Input**: Search input never feels laggy or delayed
   * - **Non-blocking Filtering**: Expensive search operations don't block typing
   * - **Concurrent Updates**: React prioritizes input updates over filtering
   * - **Smooth UX**: No stuttering during rapid typing sequences
   * - **Performance**: Automatic batching of deferred updates
   *
   * @performance-impact
   * - Prevents dropped keystrokes during heavy filtering operations
   * - Allows React to interrupt filtering for higher-priority updates
   * - Enables smooth search experience with large image collections
   * - Optimizes rendering priority for better perceived performance
   *
   * @concurrent-behavior
   * - searchQuery updates immediately (urgent updates)
   * - deferredSearchQuery updates are scheduled as non-urgent
   * - React can interrupt filtering to handle new input
   * - Results appear smoothly without blocking further input
   *
   * @see {@link https://react.dev/reference/react/useDeferredValue} React useDeferredValue docs
   */
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    // Track gallery view
    analytics.trackGalleryViewed();
  }, []);

  /**
   * Memoized Image Filtering with Concurrent Rendering Optimization
   *
   * Uses the deferred search query to filter images in a performance-optimized way.
   * Combined with useDeferredValue, this ensures filtering operations don't block
   * the UI thread while maintaining responsive search input behavior.
   *
   * @memoized Only recalculates when deferredSearchQuery changes
   * @concurrent Works with React 18's time-slicing for smooth performance
   *
   * Search Strategy:
   * 1. Keyword-based matching for semantic search
   * 2. Category filtering for organized browsing
   * 3. Alternative text matching for accessibility
   * 4. Partial string matching for flexible search
   *
   * @performance
   * - Uses deferred value to prevent blocking during rapid typing
   * - Memoization prevents unnecessary recalculations
   * - Efficient array filtering with early returns
   * - Optimized for large image collections (100+ images)
   */
  const filteredImages = useMemo(() => {
    if (!deferredSearchQuery.trim()) {
      return images;
    }

    const query = deferredSearchQuery.toLowerCase().trim();
    return images.filter(
      image =>
        image.keywords.some(keyword => keyword.includes(query)) ||
        image.category.includes(query) ||
        image.alt.toLowerCase().includes(query)
    );
  }, [deferredSearchQuery]);

  const openLightbox = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
    analytics.track('gallery_image_opened', undefined, { imageIndex: idx });
  };

  const closeLightbox = () => setLightboxOpen(false);

  // Show if search is actively being processed (concurrent rendering indicator)
  const isSearching = searchQuery !== deferredSearchQuery;

  return (
    <>
      {/* Enhanced Search Interface */}
      <div className="gallery-search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search our memories... (try: engagement, couple, venue, details)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="gallery-search-input"
            aria-label="Search wedding photos"
          />
          <div className="search-icon">🔍</div>
          {isSearching && (
            <div className="search-processing" aria-live="polite">
              Processing...
            </div>
          )}
        </div>

        {/* Search Results Summary */}
        <div className="search-results-summary" aria-live="polite">
          {deferredSearchQuery ? (
            <span>
              Found {filteredImages.length}{' '}
              {filteredImages.length === 1 ? 'photo' : 'photos'}
              {deferredSearchQuery && ` for "${deferredSearchQuery}"`}
            </span>
          ) : (
            <span>Showing all {images.length} photos</span>
          )}
        </div>

        {/* Quick Filter Categories */}
        <div className="gallery-categories">
          <button
            onClick={() => setSearchQuery('')}
            className={`category-button ${!searchQuery ? 'active' : ''}`}
            type="button"
          >
            All ({images.length})
          </button>
          {['engagement', 'couple', 'family', 'venue', 'details', 'nature'].map(
            category => {
              const count = images.filter(
                img => img.category === category
              ).length;
              return count > 0 ? (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className={`category-button ${deferredSearchQuery === category ? 'active' : ''}`}
                  type="button"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} (
                  {count})
                </button>
              ) : null;
            }
          )}
        </div>
      </div>

      {/* Gallery Grid with Enhanced Performance */}
      <div className="gallery-grid">
        {filteredImages.length > 0 ? (
          filteredImages.map((imageData, idx) => (
            <LazyImage
              key={`${imageData.url}-${idx}`}
              src={imageData.url}
              alt={imageData.alt}
              onClick={() => openLightbox(idx)}
              loading={idx < 6 ? 'eager' : 'lazy'}
              priority={idx < 6}
              className="gallery-image"
            />
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">📸</div>
            <h3>No photos found</h3>
            <p>
              Try searching for different keywords like "couple", "engagement",
              or "venue"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-button"
              type="button"
            >
              Show All Photos
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <SwipeableLightbox
          images={filteredImages.map(img => img.url)}
          initialIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
