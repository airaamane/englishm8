import { FloatingClouds } from "./FloatingClouds";
import { AnimatedSun } from "./AnimatedSun";
import { GrassFooter } from "./GrassFooter";

export function BackgroundScene() {
  return (
    <>
      <FloatingClouds />
      <AnimatedSun />
      <GrassFooter />
    </>
  );
}
