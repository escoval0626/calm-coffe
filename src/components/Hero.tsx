import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown } from "lucide-react";

import hero1 from "@/assets/images/hero-1.png";
import hero2 from "@/assets/images/hero-2.png";
import hero3 from "@/assets/images/hero-3.png";

const images = [hero1, hero2, hero3];

const heroTexts = [
  { main: "深呼吸できる、", sub: "場所と一杯。" },
  { main: "穏やかに流れる、", sub: "時間と香り。" },
  { main: "静けさの中に、", sub: "上質な余白。" },
];

function SplitText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <>
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 40, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            delay: delay + i * 0.05,
            duration: 0.8,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          style={{ display: "inline-block" }}
        >
          {char}
        </motion.span>
      ))}
    </>
  );
}

function FloatingParticles() {
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      size: 1 + Math.random() * 3,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 0.7]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center ken-burns"
            style={{ backgroundImage: `url(${images[index]})` }}
          />
          <motion.div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </motion.div>
      </AnimatePresence>

      <FloatingParticles />

      {/* Hero Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col justify-center px-8 md:px-24 lg:px-32"
        style={{ y: textY, scale }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="max-w-3xl"
          >
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-12 h-[1px] bg-calm-accent-brass" />
              <span className="text-white/60 text-[10px] uppercase tracking-[0.4em]">
                Nagareyama Otakanomori
              </span>
            </motion.div>

            {/* Main text with character animation */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl text-white mb-4 leading-[1.15]">
              <SplitText text={heroTexts[index].main} delay={0.3} />
              <br />
              <SplitText text={heroTexts[index].sub} delay={0.8} />
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="text-white/50 text-[13px] md:text-base leading-relaxed mt-6 max-w-md"
            >
              流山おおたかの森の静かな一角に佇む、<br />
              一杯のコーヒーと穏やかな時間。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-10"
            >
              <a
                href="#shop"
                className="group relative px-8 md:px-10 py-4 overflow-hidden border border-white/30 text-white text-[11px] md:text-sm tracking-[0.2em] uppercase transition-all duration-700 hover:border-white/60 btn-calm text-center"
              >
                <span className="absolute inset-0 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]" />
                <span className="relative z-10 group-hover:text-calm-text transition-colors duration-700">
                  Online Shop
                </span>
              </a>
              <a
                href="#menu"
                className="group relative px-8 md:px-10 py-4 overflow-hidden border border-white/30 text-white text-[11px] md:text-sm tracking-[0.2em] uppercase transition-all duration-700 hover:border-white/60 btn-calm text-center"
              >
                <span className="absolute inset-0 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]" />
                <span className="relative z-10 group-hover:text-calm-text transition-colors duration-700">
                  View Menu
                </span>
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Slide indicators */}
      <div className="absolute bottom-16 left-8 md:left-24 lg:left-32 z-10">
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-[2px] transition-all duration-1000 cursor-pointer ${
                  i === index ? "w-16 bg-calm-accent-brass" : "w-6 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
            {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-16 right-8 md:right-24 lg:right-32 z-10 flex flex-col items-center gap-3"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] writing-mode-vertical"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <ChevronDown className="w-4 h-4 text-white/30" />
      </motion.div>

      {/* Side vertical line */}
      <div className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 z-10 hidden lg:block">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
      </div>
    </section>
  );
}
