export function AnimatedSun() {
  return (
    <div
      className="fixed top-4 right-8 pointer-events-none z-0"
      style={{ width: 90, height: 90 }}
      aria-hidden="true"
    >
      {/* Animated rays */}
      <div
        className="absolute inset-0"
        style={{ animation: "sunRaySpin 20s linear infinite" }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-sun"
            style={{
              width: 4,
              height: 18,
              left: "50%",
              top: -10,
              marginLeft: -2,
              transformOrigin: "50% 55px",
              transform: `rotate(${i * 45}deg)`,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* Sun circle */}
      <div
        className="absolute rounded-full bg-sun flex items-center justify-center text-4xl animate-pulse-glow"
        style={{
          width: 64,
          height: 64,
          top: 13,
          left: 13,
        }}
      >
        😊
      </div>
    </div>
  );
}
