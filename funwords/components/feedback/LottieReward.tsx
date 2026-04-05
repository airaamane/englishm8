"use client";

interface LottieRewardProps {
  type?: "success" | "thumbsUp" | "confetti" | "loading" | "wave";
  className?: string;
}

const lottieMap = {
  success: "/lotties/success-star.lottie",
  thumbsUp: "/lotties/thumbs-up.lottie",
  confetti: "/lotties/confetti-burst.lottie",
  loading: "/lotties/loading-bounce.lottie",
  wave: "/lotties/waving-character.lottie",
};

export function LottieReward({ type = "success", className }: LottieRewardProps) {
  // Placeholder — will render the DotLottie player when real .lottie files are added
  const src = lottieMap[type];

  return (
    <div className={className} aria-hidden="true">
      {/* TODO: Replace with <DotLottieReact src={src} autoplay loop /> when lottie files are ready */}
      <div className="w-24 h-24 flex items-center justify-center text-5xl animate-bounce-slow">
        {type === "success" && "⭐"}
        {type === "thumbsUp" && "👍"}
        {type === "confetti" && "🎊"}
        {type === "loading" && "⏳"}
        {type === "wave" && "👋"}
      </div>
    </div>
  );
}
