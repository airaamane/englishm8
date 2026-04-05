export function FloatingClouds() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div
        className="absolute w-32 h-16 bg-white/60 rounded-full"
        style={{
          top: "8%",
          animation: "cloudFloat 25s linear infinite",
        }}
      />
      <div
        className="absolute w-48 h-20 bg-white/40 rounded-full"
        style={{
          top: "15%",
          animation: "cloudFloat 30s linear infinite",
          animationDelay: "-10s",
        }}
      />
      <div
        className="absolute w-24 h-12 bg-white/50 rounded-full"
        style={{
          top: "25%",
          animation: "cloudFloat 35s linear infinite",
          animationDelay: "-20s",
        }}
      />
    </div>
  );
}
