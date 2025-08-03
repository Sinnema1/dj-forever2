// Enhanced PWA Service Worker for Offline Functionality

const CACHE_NAME = "wedding-site-v1";
const OFFLINE_URL = "/offline.html";

// Core assets to cache for offline functionality
const ESSENTIAL_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.svg",
  // Add critical CSS and JS files
];

// Cache wedding details and basic content
const WEDDING_CONTENT = ["/api/wedding-details", "/api/basic-info"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_ASSETS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Handle navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Handle API requests with cache-first strategy for static content
  if (event.request.url.includes("/api/wedding-details")) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          // Return cached version, but update in background
          fetch(event.request).then((fetchResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
            });
          });
          return response;
        }
        return fetch(event.request);
      })
    );
    return;
  }

  // Handle images with cache-first strategy
  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
            });
            return fetchResponse;
          })
        );
      })
    );
  }
});

// Background sync for RSVP submissions when online
self.addEventListener("sync", (event) => {
  if (event.tag === "rsvp-sync") {
    event.waitUntil(syncRSVPData());
  }
});

async function syncRSVPData() {
  // Get pending RSVP data from IndexedDB
  // Send to server when back online
  // This would integrate with your existing RSVP system
}
