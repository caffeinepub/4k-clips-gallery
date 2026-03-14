# Modern Clips

## Current State
A basic video clip gallery (Clip4K) with:
- Admin-only upload via file or YouTube/MP4 URL
- Public clip browsing in a 3-column grid
- Hero section + feature highlights
- Authorization (admin/user roles) and blob-storage for file uploads
- Delete clips (admin only)

## Requested Changes (Diff)

### Add
- Full SaaS landing page: hero, features grid, how-it-works steps, FAQ accordion, CTA banner
- Multi-page navigation: Landing, Dashboard (logged-in users), Admin Panel
- User video uploads: any logged-in user can upload their own videos and create clips
- Clip metadata: aspect ratio (9:16, 1:1, 16:9), duration estimate, part number
- User dashboard: lists user's own uploaded videos and generated clips, storage usage
- Admin panel: user list with roles, total clip/video counts, ability to promote/demote users
- Clip editor UI: set title, caption, aspect ratio, trim start/end (frontend-only, no server-side processing)
- Download button on each clip card
- Modern dark SaaS branding with gradient CTAs, smooth animations

### Modify
- VideoClip type: add aspectRatio, partNumber, uploaderPrincipal fields
- addVideoClip / addVideoClipFromUrl: open to all authenticated users (not admin-only)
- listClips: add listMyClips (returns only caller's clips)
- Nav: add Dashboard and Admin Panel links

### Remove
- Admin-only restriction on adding clips (now any user can add)

## Implementation Plan
1. Extend backend:
   - Add aspectRatio and partNumber fields to VideoClip
   - Add uploaderPrincipal to VideoClip
   - Change addVideoClip/addVideoClipFromUrl to require #user (not #admin)
   - Add listMyClips() query
   - Add getAdminStats() returning user count, clip count (admin only)
   - Add listAllUsers() returning list of principals + roles (admin only)
   - Add promoteToAdmin / demoteFromAdmin (admin only)
2. Frontend SaaS overhaul:
   - Landing page with hero, features, how-it-works, FAQ, pricing-free badge, CTA
   - React Router or tab-based navigation: Landing / Dashboard / Admin
   - Dashboard: user's clips grid, upload button, storage info
   - Admin panel: users table, stats cards
   - Clip cards: show aspect ratio badge, download button
   - Upload dialog: add aspect ratio selector, part number field
   - Modern dark theme with gradient buttons and animated sections
