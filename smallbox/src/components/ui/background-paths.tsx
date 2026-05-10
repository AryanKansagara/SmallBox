"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle } from "lucide-react";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.018}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPathsHero() {
  const headline = "Enterprise tools. Small business price.";
  const words = headline.split(" ");

  return (
    <section className="relative pt-36 pb-28 px-6 md:px-12 overflow-hidden">
      {/* Animated path overlay */}
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />

      {/* Subtle purple glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm text-primary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Powered by IBM watsonx.ai — Free for small businesses
          </div>
        </motion.div>

        {/* Headline with letter animation */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-[0.3em] last:mr-0">
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={`${wordIndex}-${letterIndex}`}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: wordIndex * 0.08 + letterIndex * 0.025,
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                  }}
                  className={
                    wordIndex >= 3
                      ? "inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#7b2fff] via-[#ff4dab] to-[#ff8c42]"
                      : "inline-block text-white"
                  }
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-lg text-white/55 mb-10 leading-relaxed max-w-xl mx-auto"
        >
          SmallBox gives your business the same IBM-powered AI, analytics, and
          automation that Fortune 500 companies use — with zero technical
          expertise required.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex items-center justify-center gap-4 flex-wrap mb-10"
        >
          <Link href="/onboarding">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(123,47,255,0.55)" }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base shadow-[0_0_20px_rgba(123,47,255,0.35)]"
            >
              Start Building Free
              <ArrowRight size={18} />
            </motion.button>
          </Link>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 border border-white/15 hover:border-primary/35 text-white font-semibold px-8 py-3.5 rounded-full transition-all text-base backdrop-blur-sm bg-white/5"
            >
              View Dashboard
              <ChevronRight size={16} />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-6 text-sm text-white/35 flex-wrap"
        >
          {["No credit card required", "Free forever on IBM free tier", "Setup in under 5 minutes"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
