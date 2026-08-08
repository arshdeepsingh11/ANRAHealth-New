export default function Marquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden bg-ink py-4" style={{ background: "#3B7EA1" }}>
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marqueeScroll 32s linear infinite;
        }
      `}</style>
      <div className="flex whitespace-nowrap marquee-track">
        {[0, 1].map((rep) => (
          <span key={rep} className="text-sm md:text-base text-white px-8 flex items-center gap-8">
            <span>{text}</span>
            <span aria-hidden="true">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
