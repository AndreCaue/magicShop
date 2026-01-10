import { motion, useAnimation, type Variants } from "framer-motion";
import { Link } from "react-router-dom";

const smokeVariants: Variants = {
  initial: {
    opacity: 1,
    filter: "blur(0px)",
    scale: 1,
    y: 0,
  },
  hover: {
    opacity: 0,
    filter: "blur(12px)",
    scale: 1.6,
    y: 0,
    transition: {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

type TSmokeLink = {
  textLabel: string;
  goTo: string;
  isMobile?: boolean;
};

export const SmokeLink = ({ goTo, textLabel, isMobile }: TSmokeLink) => {
  const controls = useAnimation();

  if (isMobile)
    return (
      <motion.div
        whileTap={{
          scale: 0.96,
          opacity: 0.7,
          filter: "blur(1.5px)",
        }}
        transition={{
          duration: 0.15,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <Link to={goTo} className="text-white text-center block">
          {textLabel}
        </Link>
      </motion.div>
    );

  // Desktop
  return (
    <div
      className="relative flex self-center w-fit"
      onMouseEnter={() => controls.start("hover")}
      onMouseLeave={() => controls.start("initial")}
    >
      <motion.div variants={smokeVariants} initial="initial" animate={controls}>
        <Link to={goTo} className="text-white text-center block">
          {textLabel}
        </Link>
      </motion.div>
    </div>
  );
};
