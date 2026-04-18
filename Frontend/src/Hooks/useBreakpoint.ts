import { useEffect, useState } from "react";
import defaultTheme from "tailwindcss/defaultTheme";

const screens = defaultTheme.screens as Record<string, string>;

const breakpoints = Object.fromEntries(
  Object.entries(screens).map(([key, value]) => [
    key,
    parseInt(value.replace("px", "")),
  ]),
);

type BreakpointKey = keyof typeof breakpoints | "base";

export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const current: BreakpointKey = Object.entries(breakpoints).reduce(
    (acc, [key, value]) => (width >= value ? (key as BreakpointKey) : acc),
    "base" as BreakpointKey,
  );

  return {
    width,
    current,
    isSm: width >= breakpoints.sm,
    isMd: width >= breakpoints.md,
    isLg: width >= breakpoints.lg,
    isXl: width >= breakpoints.xl,
    is2xl: width >= breakpoints["2xl"],
  };
}
