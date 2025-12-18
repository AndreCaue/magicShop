import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";

const letterVariants: Variants = {
  initial: { x: 0, y: 0, rotate: 0 },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scattered: (i: number) => ({
    x: (Math.random() - 0.5) * 200, // espalha horizontalmente até 200px
    y: (Math.random() - 0.5) * 200, // espalha verticalmente até 200px
    rotate: (Math.random() - 0.5) * 360, // gira aleatoriamente
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function ScatterTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={cn("text-center w-fit h-fit ", className)}>
      <motion.h1
        className=" font-bold text-white tracking-wide cursor-default select-none"
        onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
        style={{ display: "inline-block" }}
      >
        {text.split("").map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="initial"
            animate={isHovered ? "scattered" : "initial"}
            style={{ display: "inline-block", position: "relative" }}
          >
            {letter === " " ? "\u00A0" : letter}
          </motion.span>
        ))}
      </motion.h1>
    </div>
  );
}
