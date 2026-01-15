import { motion } from "framer-motion";

export const DisplayBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-10"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360,
          }}
          animate={{
            y: [null, Math.random() * window.innerHeight],
            rotate: [null, Math.random() * 360 + 360],
            opacity: [0.1, 0.05, 0.1],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}
    </div>
  );
};
