export function parseYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function isYouTubeEmbed(url: string): boolean {
  return url.includes("youtube.com/embed/");
}

export function getYouTubeThumbnail(embedUrl: string): string {
  const m = embedUrl.match(/youtube\.com\/embed\/([^?]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : "";
}
