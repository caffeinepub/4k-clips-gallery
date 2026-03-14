export interface CaptionPhrase {
  text: string;
  startSec: number;
  endSec: number;
}

/**
 * Splits title + caption text into timed 3-5 word phrases
 * distributed evenly across 60 seconds.
 */
export function generateCaptions(
  title: string,
  caption: string,
  totalDuration = 60,
): CaptionPhrase[] {
  const combined = [title, caption].filter(Boolean).join(". ");
  const words = combined.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const phrases: string[] = [];
  let i = 0;
  while (i < words.length) {
    // Each chunk is 3–5 words
    const chunkSize = 3 + (i % 3); // cycles: 3,4,5,3,4,5...
    phrases.push(words.slice(i, i + chunkSize).join(" "));
    i += chunkSize;
  }

  const phraseDuration = totalDuration / phrases.length;

  return phrases.map((text, idx) => ({
    text,
    startSec: idx * phraseDuration,
    endSec: (idx + 1) * phraseDuration,
  }));
}

/**
 * Returns the active caption phrase for a given playback time.
 */
export function getActiveCaptionPhrase(
  phrases: CaptionPhrase[],
  currentSec: number,
): CaptionPhrase | null {
  return (
    phrases.find((p) => currentSec >= p.startSec && currentSec < p.endSec) ??
    null
  );
}
