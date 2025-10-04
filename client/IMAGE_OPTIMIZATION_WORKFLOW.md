# Image Optimization Workflow

## Overview

This document outlines the proper long-term image management strategy for the DJ Forever 2 wedding
website.

## Root Cause Analysis (Resolved)

- **Issue**: Imagemin was failing on JPEG files during production builds
- **Symptoms**: `imagemin error:` messages for story images, build slowdowns
- **Root Cause**: JPEG recompression was causing errors with certain image formats/metadata
- **Solution**: Disabled JPEG optimization in imagemin, kept PNG/SVG optimization active

## Current Image Structure

```
client/src/assets/images/
├── gallery/              # Gallery images (now optimized)
├── optimized/           # Pre-optimized versions with responsive sizing
├── registries/          # Registry links and logos
└── story-*.jpeg         # Timeline story images (optimized)
```

## Image Optimization Strategy

### 1. Manual Pre-Optimization (Preferred)

- **Tool**: Use `/optimized/` directory for responsive image sets
- **Benefits**: Better control, consistent quality, faster builds
- **Format**: Generate multiple sizes (small, medium, large, xl) + WebP variants

### 2. Automated PNG/SVG Optimization (Active)

- **Tool**: vite-plugin-imagemin (JPEG disabled, PNG/SVG enabled)
- **Configuration**: Optimizes new PNG/SVG files during build
- **Safety**: Can be disabled via `SKIP_IMAGEMIN=true` environment variable

### 3. Emergency Disable (Available)

```bash
# If imagemin causes issues in the future
SKIP_IMAGEMIN=true npm run build
```

## Best Practices for New Images

### Adding New Photos

1. **Large images (>1MB)**: Always pre-optimize before adding to repository
2. **Gallery images**: Replace with optimized versions immediately
3. **Story timeline**: Keep under 500KB, optimize manually if needed
4. **Cover photos**: Create responsive versions in `/optimized/` directory

### File Size Guidelines

- **Gallery images**: 200-400KB (optimized JPEG)
- **Story timeline**: 200-500KB (progressive JPEG)
- **Cover photos**: 100-300KB (multiple responsive sizes)
- **Icons/logos**: Use SVG when possible, optimize PNG with imagemin

## Vite Configuration Details

```typescript
// Current imagemin setup - JPEG optimization disabled
viteImagemin({
  gifsicle: { optimizationLevel: 3 },
  // mozjpeg: DISABLED - prevents build errors
  pngquant: { quality: [0.65, 0.8] },
  svgo: {
    /* SVG optimization active */
  },
  disable: process.env.SKIP_IMAGEMIN === 'true',
});
```

## Troubleshooting Future Issues

### If Build Errors Return

1. Check for new large images (>1MB)
2. Replace with optimized versions from `/optimized/` directory
3. Temporarily disable imagemin: `SKIP_IMAGEMIN=true npm run build`
4. Re-optimize problematic images manually

### Performance Monitoring

- **Build time target**: <3 seconds (currently 2.28s)
- **Bundle size**: Monitor via bundle analyzer
- **Image cache**: Leverages service worker for optimal loading

## Success Metrics (Current)

- ✅ Clean build output (no imagemin errors)
- ✅ Fast builds (2.28s vs previous 5.38s)
- ✅ Optimized bundle sizes maintained
- ✅ All images properly cached in service worker
- ✅ Emergency disable option available

## Migration Notes

This workflow was established after resolving JPEG optimization conflicts. The approach prioritizes
build stability while maintaining image quality and performance optimization.
