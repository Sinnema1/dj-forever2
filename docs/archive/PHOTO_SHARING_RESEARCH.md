# Photo Sharing Solution Research

## User Requirements

- **Preference**: Google Photos/Drive or other free services
- **Fallback**: AWS S3 or Cloudinary (need more information)
- **Goal**: Guest photo sharing feature for wedding website

---

## Free/Low-Cost Options

### 1. Google Photos API + Google Drive

**Pros**:

- ✅ Free tier: 15GB shared across Google services
- ✅ Familiar interface for users
- ✅ Built-in image optimization and CDN
- ✅ OAuth authentication available
- ✅ Direct sharing via Google account

**Cons**:

- ❌ API limitations (read-only for Google Photos API)
- ❌ Google Drive API more complex for photo galleries
- ❌ User needs Google account to upload
- ❌ Storage limit can be reached quickly with wedding photos

**Implementation**:

- Use Google Drive API for upload/storage
- Create shared folder per wedding event
- Build custom gallery view using Drive thumbnails
- Requires OAuth 2.0 authentication flow

**Cost**: Free (up to 15GB), then $1.99/mo for 100GB

---

### 2. Imgur API

**Pros**:

- ✅ Free tier: Unlimited uploads (with rate limits)
- ✅ No authentication required for uploads
- ✅ Built-in CDN and image hosting
- ✅ Simple REST API
- ✅ Automatic thumbnail generation

**Cons**:

- ❌ Public by default (privacy concerns for wedding photos)
- ❌ Rate limits: 12,500 requests/day, 500 uploads/day
- ❌ No guaranteed storage permanence
- ❌ May display ads on hosted images

**Implementation**:

- Anonymous uploads via API
- Store Imgur URLs in MongoDB
- Client-side upload from mobile devices
- Gallery view using Imgur thumbnails

**Cost**: Free with limits, or $5.99/mo for Pro (no ads, priority support)

---

### 3. Cloudinary (Free Tier)

**Pros**:

- ✅ Free tier: 25 credits/month (~25GB storage + 25GB bandwidth)
- ✅ Automatic image optimization
- ✅ Built-in transformations (resize, crop, filters)
- ✅ CDN included
- ✅ Developer-friendly API
- ✅ No surprise costs with usage alerts

**Cons**:

- ⚠️ Limited free tier (may exceed for large weddings)
- ⚠️ Need to monitor usage
- ⚠️ Paid plans start at $99/mo (significant jump)

**Implementation**:

- Direct upload from client using signed uploads
- Store Cloudinary public IDs in MongoDB
- Use transformation URLs for responsive images
- Implement upload widget for easy UX

**Cost**: Free (25 credits/mo), then $99/mo for Plus plan

---

### 4. AWS S3 (Free Tier + Pay-As-You-Go)

**Pros**:

- ✅ Free tier: 5GB storage, 20,000 GET requests, 2,000 PUT requests (12 months)
- ✅ Highly scalable and reliable
- ✅ Fine-grained access control
- ✅ Integration with CloudFront CDN
- ✅ Pay only for what you use

**Cons**:

- ⚠️ After free tier: ~$0.023/GB storage + bandwidth costs
- ⚠️ More complex setup (IAM, bucket policies)
- ⚠️ No built-in image optimization
- ⚠️ Need to implement upload UI

**Implementation**:

- Pre-signed URLs for secure uploads
- Lambda functions for image processing
- CloudFront for CDN delivery
- MongoDB stores S3 object keys

**Estimated Cost** (after free tier):

- 10GB storage: ~$0.23/mo
- 50GB bandwidth: ~$4.50/mo
- Total: ~$5/mo for typical wedding website

---

### 5. Supabase Storage

**Pros**:

- ✅ Free tier: 1GB storage, 2GB bandwidth
- ✅ Built-in authentication
- ✅ PostgreSQL database included
- ✅ Real-time subscriptions
- ✅ Image transformations available

**Cons**:

- ⚠️ Limited free tier
- ⚠️ Paid plans: $25/mo (100GB storage, 200GB bandwidth)
- ⚠️ Another service to manage
- ⚠️ Would need to migrate from MongoDB (or run both)

**Implementation**:

- Direct uploads via Supabase SDK
- Row-level security for access control
- Built-in CDN
- Image transformations on-the-fly

**Cost**: Free (1GB), $25/mo for Pro

---

## Recommendations

### Option A: Start Simple with Imgur (Immediate)

**Best for**: Quick implementation, testing guest photo sharing feature
**Timeline**: 1-2 days to implement
**Risk**: Privacy concerns, rate limits, not ideal for long-term storage
**Action**:

1. Implement Imgur API integration
2. Add upload widget to guest dashboard
3. Create gallery view with thumbnails
4. Monitor usage and user feedback
5. Migrate to better solution later if needed

---

### Option B: Google Drive API (Moderate Complexity)

**Best for**: Familiar user experience, reasonable free tier
**Timeline**: 3-4 days to implement OAuth + API integration
**Risk**: API complexity, storage limits, requires Google account
**Action**:

1. Set up Google Cloud Console project
2. Implement OAuth 2.0 authentication flow
3. Create shared Drive folder per user/event
4. Build custom gallery using Drive API
5. Monitor 15GB storage limit

---

### Option C: Cloudinary Free Tier (Best Developer Experience)

**Best for**: Professional solution with free tier, easy scaling path
**Timeline**: 2-3 days to implement
**Risk**: May exceed free tier for large weddings, big price jump to paid
**Action**:

1. Sign up for Cloudinary account
2. Implement upload widget
3. Store Cloudinary URLs in MongoDB
4. Use transformation API for responsive images
5. Monitor 25 credit/month usage

---

### Option D: AWS S3 (Long-term Scalable Solution)

**Best for**: Full control, predictable costs, professional wedding website
**Timeline**: 4-5 days to implement (S3, IAM, CloudFront)
**Risk**: More complex, requires AWS knowledge, ongoing costs
**Action**:

1. Create S3 bucket with proper CORS settings
2. Set up IAM policies for secure access
3. Implement pre-signed URL uploads
4. Add CloudFront CDN for fast delivery
5. Build image optimization pipeline (optional: Lambda)

---

## Cost Comparison (First Year)

| Solution         | Setup Cost | Monthly Cost (avg)    | First Year Total | Pros                  | Cons                   |
| ---------------- | ---------- | --------------------- | ---------------- | --------------------- | ---------------------- |
| **Imgur**        | $0         | $0 (free tier)        | **$0**           | Easiest, fastest      | Privacy, ads, limits   |
| **Google Drive** | $0         | $0 (under 15GB)       | **$0-24**        | Familiar, free tier   | API complexity, limits |
| **Cloudinary**   | $0         | $0 (under 25 credits) | **$0-1188**      | Best DX, optimization | Expensive if exceed    |
| **AWS S3**       | $0         | $0-10                 | **$0-120**       | Scalable, reliable    | Setup complexity       |
| **Supabase**     | $0         | $25                   | **$300**         | All-in-one            | Need to migrate DB     |

---

## My Recommendation: **Phased Approach**

### Phase 1: Start with Imgur (Week 1)

- Quick to implement
- Validates guest interest in photo sharing
- Tests upload/gallery UX
- Gather user feedback
- **Estimated cost**: $0

### Phase 2: Evaluate and Migrate (Week 4-6)

**If feature is popular** (>50 photos uploaded):

- Migrate to **Cloudinary** for professional experience
- Or implement **AWS S3** for cost efficiency and control

**If feature is not used much**:

- Keep Imgur (free, simple)
- No migration needed

---

## Next Steps

1. **Research Question**: What's the expected photo volume?

   - Number of guests: ?
   - Expected photos per guest: ?
   - Total estimated photos: ?
   - Average photo size: ~3-5MB (smartphone photos)

2. **Privacy Requirements**:

   - Should photos be private (only invited guests)?
   - Public gallery for all website visitors?
   - Downloadable by other guests?

3. **Feature Scope**:
   - Upload only?
   - Comments/likes on photos?
   - Photo moderation/approval by admin?
   - Auto-slideshow in gallery?

**Once we answer these questions, I can provide a more specific implementation plan!**

---

## Additional Free Alternatives to Research

- **Firebase Storage** (1GB free, then $0.026/GB)
- **Backblaze B2** (10GB free, then $0.005/GB - cheapest)
- **DigitalOcean Spaces** ($5/mo for 250GB, no free tier)
- **Azure Blob Storage** (5GB free for 12 months)

Would you like me to research any of these in more detail?
