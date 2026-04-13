interface MarqueeProps {
  text: string;
  repeat?: number;
}

export default function Marquee({ text, repeat = 6 }: MarqueeProps) {
  const items = Array.from({ length: repeat }, (_, i) => i);

  return (
    <div className="overflow-hidden py-8 border-y border-calm-base/15">
      <div className="flex marquee-track whitespace-nowrap">
        {items.map((i) => (
          <span
            key={i}
            className="text-6xl md:text-8xl font-serif text-calm-base/15 mx-8 select-none shrink-0"
          >
            {text}
            <span className="text-calm-accent-brass/20 mx-6">✦</span>
          </span>
        ))}
        {items.map((i) => (
          <span
            key={`dup-${i}`}
            className="text-6xl md:text-8xl font-serif text-calm-base/15 mx-8 select-none shrink-0"
          >
            {text}
            <span className="text-calm-accent-brass/20 mx-6">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
