import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";

const letterVariants: Variants = {
  initial: { x: 0, y: 0, rotate: 0 },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scattered: (i: number) => ({
    x: (Math.random() - 0.5) * 800,
    y: (Math.random() - 0.5) * 800,
    rotate: (Math.random() - 0.5) * 360,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

export default function ScatterBtn({
  text,
  className,
  onClick,
  typeBtn = "submit",
  isSubmitting = false,
}: {
  text: string;
  className?: string;
  onClick: () => void;
  typeBtn?: "submit" | "button" | "reset" | undefined;
  isSubmitting?: boolean;
}) {
  return (
    <div className={cn("text-center w-full border h-fit  ", className)}>
      <button
        type={typeBtn}
        onClick={() => onClick()}
        className="cursor-pointer"
      >
        <motion.h1
          className="text-xl md:text-xl font-bold text-white tracking-wide cursor-pointer select-none w-full"
          style={{ display: "inline-block" }}
        >
          {text.split("").map((letter, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="initial"
              animate={isSubmitting ? "scattered" : "initial"}
              style={{
                display: "inline-block",
                position: "relative",
                cursor: "pointer",
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.h1>
      </button>
    </div>
  );
}
