import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clapperboard,
  Download,
  Film,
  Play,
  Scissors,
  Share2,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import LoginButton from "./LoginButton";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Detection",
    desc: "Automatically finds the most engaging moments in your long-form videos.",
  },
  {
    icon: Film,
    title: "Auto Captions",
    desc: "Bold animated subtitles generated from your clip's title and content.",
  },
  {
    icon: Scissors,
    title: "Multi-Format Export",
    desc: "Export as 9:16 Shorts, 1:1 Square, or 16:9 Landscape in one click.",
  },
  {
    icon: Download,
    title: "Instant Download",
    desc: "Download your clips in HD quality with zero compression loss.",
  },
  {
    icon: Zap,
    title: "Free Forever",
    desc: "No paywalls, no watermarks, no subscriptions. Completely free to use.",
  },
  {
    icon: Upload,
    title: "Easy Upload",
    desc: "Drag-and-drop your video file or paste a YouTube link to get started.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Upload Your Video",
    desc: "Drop your long-form video file or paste a YouTube URL. We support all major formats.",
    icon: Upload,
  },
  {
    num: "02",
    title: "AI Generates Clips",
    desc: "Our system automatically identifies viral moments and slices them into short clips.",
    icon: Sparkles,
  },
  {
    num: "03",
    title: "Download & Share",
    desc: "Export clips in your chosen format and share directly to TikTok, Reels, or YouTube Shorts.",
    icon: Share2,
  },
];

const FAQ = [
  {
    q: "Is ModernClips really free?",
    a: "Yes, completely free. No credit card required, no hidden fees, and no watermarks on your exports.",
  },
  {
    q: "What video formats are supported?",
    a: "We support MP4, MOV, AVI, and most common video formats. You can also paste a YouTube link to import videos directly.",
  },
  {
    q: "How long can my source video be?",
    a: "Source videos can be up to 2 hours long. The system will automatically split long videos into 1-minute viral clips.",
  },
  {
    q: "What aspect ratios can I export?",
    a: "You can export in 9:16 (TikTok/Reels/Shorts), 1:1 (Instagram feed), and 16:9 (YouTube/landscape) formats.",
  },
  {
    q: "Can I add custom captions?",
    a: "Absolutely. You can write custom captions for each clip, or let the platform auto-generate them from your video title.",
  },
];

interface Props {
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export default function LandingPage({
  onNavigate,
  isAdmin,
  isLoggedIn,
}: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header
        className="fixed top-0 inset-x-0 z-50 border-b border-border/30 bg-background/70 backdrop-blur-xl"
        data-ocid="nav.section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display font-black text-lg tracking-tight">
              Modern<span className="text-primary">Clips</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                size="sm"
                onClick={() => onNavigate("dashboard")}
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                data-ocid="nav.primary_button"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <LoginButton />
                <Button
                  size="sm"
                  onClick={() => onNavigate("dashboard")}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold hidden sm:flex"
                  data-ocid="nav.primary_button"
                >
                  Get Started Free
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigate("admin")}
                className="border-border text-foreground hover:bg-secondary hidden md:flex"
                data-ocid="nav.secondary_button"
              >
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden"
          data-ocid="hero.section"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.07]"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.72 0.28 25) 0%, transparent 65%)",
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
              style={{
                background:
                  "radial-gradient(ellipse, oklch(0.65 0.22 145) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <Badge
                variant="outline"
                className="border-primary/30 text-primary bg-primary/10 text-xs font-bold tracking-widest uppercase px-3 py-1 mb-8 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                AI-Powered Video Clipping
              </Badge>
            </motion.div>

            <motion.h1
              className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.9] tracking-tight mb-6"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
            >
              Turn Long Videos
              <br />
              <span className="text-primary">Into Viral Clips</span>
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
            >
              Upload any long-form video and ModernClips automatically detects
              the best moments, adds captions, and exports short clips ready for
              TikTok, Reels, and Shorts.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 rounded-xl"
                onClick={() => onNavigate("dashboard")}
                data-ocid="hero.primary_button"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2 border-border text-foreground hover:bg-secondary font-semibold text-base px-8 rounded-xl"
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                data-ocid="hero.secondary_button"
              >
                <Play className="w-4 h-4" /> How It Works
              </Button>
            </motion.div>

            <motion.div
              className="mt-14 flex flex-wrap items-center justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {[
                { value: "100%", label: "Free Forever" },
                { value: "3 Formats", label: "9:16 \u00b7 1:1 \u00b7 16:9" },
                { value: "HD", label: "High Definition" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center">
                  <span className="font-display font-black text-2xl text-foreground">
                    {s.value}
                  </span>
                  <span className="text-muted-foreground text-xs uppercase tracking-widest mt-0.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-24 px-4 sm:px-6 border-t border-border/40"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="text-primary text-sm font-bold tracking-widest uppercase mb-3">
                Features
              </p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
                Everything You Need
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                A complete toolkit for creating viral short-form content from
                long videos.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors duration-300"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i * 0.5}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="py-24 px-4 sm:px-6 border-t border-border/40"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="text-primary text-sm font-bold tracking-widest uppercase mb-3">
                Process
              </p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                From raw video to viral clip in three simple steps.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div
                className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-border/50"
                aria-hidden="true"
              />
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.num}
                  className="relative text-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i * 0.7}
                >
                  <div className="w-20 h-20 rounded-2xl bg-card border border-border/60 flex items-center justify-center mx-auto mb-5 relative">
                    <s.icon className="w-8 h-8 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="py-24 px-4 sm:px-6 border-t border-border/40"
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="text-primary text-sm font-bold tracking-widest uppercase mb-3">
                FAQ
              </p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <Accordion type="single" collapsible className="space-y-2">
              {FAQ.map((item, i) => (
                <AccordionItem
                  key={item.q}
                  value={`faq-${i}`}
                  className="bg-card border border-border/50 rounded-xl px-5 overflow-hidden"
                  data-ocid={`faq.item.${i + 1}`}
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/40">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className="font-display font-black text-4xl sm:text-5xl text-foreground mb-4">
              Start Clipping for{" "}
              <span className="text-primary">Free Today</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              No sign-up required. Upload your first video and get viral clips
              in minutes.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-10 rounded-xl"
              onClick={() => onNavigate("dashboard")}
              data-ocid="cta.primary_button"
            >
              <Clapperboard className="w-5 h-5" />
              Open ModernClips
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Clapperboard className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-display font-black text-base">
              Modern<span className="text-primary">Clips</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="hover:text-foreground transition-colors"
              data-ocid="footer.link"
            >
              Dashboard
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onNavigate("admin")}
                className="hover:text-foreground transition-colors"
                data-ocid="footer.link"
              >
                Admin
              </button>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
