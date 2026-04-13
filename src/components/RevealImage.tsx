import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";

interface RevealImageProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
}

export default function RevealImage({ src, alt, className = "", delay = 0 }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`overflow-hidden relative ${className}`}>
      <motion.img
        initial={{ filter: "blur(20px)", opacity: 0, scale: 1.1, y: 20 }}
        animate={
          isVisible
            ? { filter: "blur(0px)", opacity: 1, scale: 1, y: 0 }
            : { filter: "blur(20px)", opacity: 0, scale: 1.1, y: 20 }
        }
        transition={{
          duration: 1.2,
          ease: [0.215, 0.61, 0.355, 1],
          opacity: { duration: 0.8 },
          filter: { duration: 1.5 },
        }}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
