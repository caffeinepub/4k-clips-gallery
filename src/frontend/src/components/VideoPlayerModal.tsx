import { Maximize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { VideoClip } from "../backend.d";

interface Props {
  clip: VideoClip | null;
  onClose: () => void;
}

export default function VideoPlayerModal({ clip, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showCaption, setShowCaption] = useState(true);

  useEffect(() => {
    if (clip && videoRef.current) {
      videoRef.current.load();
      videoRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setPlaying(false);
    };
  }, [clip]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  const videoUrl = clip?.videoBlob.getDirectURL() ?? "";

  return (
    <AnimatePresence>
      {clip && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-ocid="player.modal"
        >
          <motion.div
            className="relative w-full max-w-6xl mx-4 rounded-xl overflow-hidden shadow-cinema"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video */}
            <div className="relative bg-black aspect-video">
              {/* biome-ignore lint/a11y/useMediaCaption: captions rendered as custom overlay below */}
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onEnded={() => setPlaying(false)}
                playsInline
              />

              {/* Caption overlay */}
              <AnimatePresence>
                {showCaption && clip.caption && (
                  <motion.div
                    className="absolute bottom-16 left-0 right-0 flex justify-center px-8"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                  >
                    <div className="video-caption-overlay bg-black/75 text-white px-4 py-2 rounded max-w-3xl text-center">
                      {clip.caption}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="text-white hover:text-primary transition-colors"
                  data-ocid="player.toggle"
                >
                  {playing ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-white hover:text-primary transition-colors"
                  data-ocid="player.toggle"
                >
                  {muted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCaption((v) => !v)}
                  className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                    showCaption
                      ? "border-primary text-primary"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                  data-ocid="player.toggle"
                >
                  CC
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="text-white hover:text-primary transition-colors"
                  data-ocid="player.button"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Info bar */}
            <div className="bg-card px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  {clip.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {clip.caption}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                data-ocid="player.close_button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
