export function GrassFooter() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-0"
      style={{ height: 40 }}
      aria-hidden="true"
    >
      <div
        className="w-full h-full"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--color-grass) 0px, var(--color-grass-dark) 20px, var(--color-grass) 40px)",
          maskImage: "linear-gradient(to top, black 60%, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black 60%, transparent)",
        }}
      />
    </div>
  );
}
