import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PixLoader() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-emerald-400"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="absolute inset-2 rounded-full border-4 border-emerald-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.3,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-4 rounded-full border-4 border-emerald-600"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: 0.6,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-0 m-auto w-6 h-8 bg-emerald-500 rotate-45 rounded-sm flex justify-center items-center text-2xl "
            animate={{ rotate: [45, 225, 405] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ♣
          </motion.div>
        </div>

        <motion.p
          className="text-emerald-600 font-medium tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Gerando PIX{dots}
        </motion.p>

        <div className="w-56 h-2 bg-emerald-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
