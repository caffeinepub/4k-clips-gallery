# 4K Clips Gallery

## Current State
New project — no existing code.

## Requested Changes (Diff)

### Add
- Public video gallery page displaying 4K video clips in a grid/list layout
- Each clip card shows: thumbnail (from video), title, and caption text below the video
- Full-screen video player modal with captions rendered as overlay subtitles
- Admin section (login-gated) to upload new clips, set title, caption text, and manage/delete existing clips
- Blob storage for video files

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: store clip metadata (id, title, caption, videoUrl, thumbnailUrl, uploadedAt)
2. Backend APIs: addClip, getClips, deleteClip
3. Blob storage for video upload
4. Authorization for admin access
5. Frontend public gallery: grid of clip cards with title + caption, click to open player
6. Video player modal: plays video with caption overlay
7. Admin panel: upload video, set title/caption, delete clips
