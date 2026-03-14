# 4K Clips Gallery — Viral Shorts Redesign

## Current State
- Grid gallery layout with horizontal 16:9 aspect ratio cards
- VideoPlayerModal opens clips in a wide modal with 16:9 aspect ratio
- Caption shown as a static overlay at the bottom of the video
- No scroll-based feed or TikTok-style navigation

## Requested Changes (Diff)

### Add
- TikTok/Reels-style full-screen vertical scroll feed (snap scrolling, one clip per screen)
- 9:16 vertical aspect ratio enforced on all video cards and player
- Animated word-by-word subtitle captions — bold white text with black outline, centered at bottom of video, phrases cycle across clip duration
- Auto-caption generation from the clip title — split into short 3-5 word phrases, timed at ~3 seconds per phrase across the 60-second clip
- "Shorts" feed view as the primary UI replacing the grid
- Up/down navigation arrows and keyboard arrow key support for moving between clips
- Clip counter indicator (e.g. 1/5) top-right
- Mute/unmute button overlay on the player
- Share-style clip info overlay (title + part number) bottom-left above captions

### Modify
- App.tsx: Replace grid gallery with vertical snap-scroll shorts feed as primary view. Keep the header/nav/upload flow.
- VideoCard: Change thumbnail from 16:9 to 9:16, show bold vertical poster style
- VideoPlayerModal: Replaced by inline full-screen vertical player within the feed
- Caption system: Replace static caption with animated phrase-cycling system

### Remove
- Grid layout (4-column responsive grid)
- Wide horizontal modal player
- Static hero section (replaced by the full-screen feed)

## Implementation Plan
1. Create `utils/captions.ts` — function to split a title/caption into timed phrase segments for animated subtitles
2. Create `components/ShortsPlayer.tsx` — full-screen 9:16 vertical video player with:
   - Inline YouTube iframe or HTML5 video
   - Animated word/phrase caption overlay (cycles through phrases with fade animation)
   - Clip info overlay (title, part badge)
   - Mute toggle, play/pause tap
   - Up/down navigation between clips
3. Create `components/ShortsFeed.tsx` — snap-scroll container that renders one ShortsPlayer per clip, full viewport height
4. Update `App.tsx` — replace grid + hero with ShortsFeed as the main content. Keep header with upload button.
5. Update `VideoCard.tsx` — change thumbnail aspect to 9:16 for any preview/grid fallback context
6. Keep UploadDialog and DeleteConfirmDialog unchanged
