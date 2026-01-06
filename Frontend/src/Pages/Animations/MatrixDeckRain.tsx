"use client";

import { motion } from "framer-motion";
import { LoginDesk } from "../Login/subPages/LoginDesk";
import { cn } from "@/lib/utils";

const deck = [
  "A♠",
  "2♠",
  "3♠",
  "4♠",
  "5♠",
  "6♠",
  "7♠",
  "8♠",
  "9♠",
  "J♠",
  "Q♠",
  "K♠",
  "A♥",
  "2♥",
  "3♥",
  "4♥",
  "5♥",
  "6♥",
  "7♥",
  "8♥",
  "9♥",
  "J♥",
  "Q♥",
  "K♥",
  "A♦",
  "2♦",
  "3♦",
  "4♦",
  "5♦",
  "6♦",
  "7♦",
  "8♦",
  "9♦",
  "J♦",
  "Q♦",
  "K♦",
  "A♣",
  "2♣",
  "3♣",
  "4♣",
  "5♣",
  "6♣",
  "7♣",
  "8♣",
  "9♣",
  "J♣",
  "Q♣",
  "K♣",
].sort(() => Math.random() - 0.5);

export default function MatrixDeckRain() {
  return (
    <div className="relative inset-0 bg-black overflow-hidden w-screen">
      {deck.map((card, i) => {
        const chars = [...card];
        const suit = chars[chars.length - 1];
        const value = chars.slice(0, -1).join("");

        const isRed = card.includes("♥") || card.includes("♦");
        const hue = isRed ? 0 : 160;
        const duration = 12 + (i % 17);
        const delay = (i * 0.35) % 15;
        const left = 2 + (i * 100) / deck.length + Math.sin(i) * 10;

        return (
          <motion.div
            key={card}
            className="absolute"
            style={{
              left: `${left}%`,
              top: -100,
              willChange: "transform",
            }}
            initial={{ y: -100 }}
            animate={{ y: window.innerHeight + 100 }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: "900",
                fontFamily: "ui-monospace, monospace",
                textShadow: `
                  0 0 8px hsl(${hue}, 100%, 70%),
                  0 0 20px hsl(${hue}, 100%, 60%),
                  0 0 40px hsl(${hue}, 100%, 50%)
                `,
                transform: `rotate(${Math.sin(i) * 20}deg)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
              }}
              className="bg-white/95 rounded px-1 py-2 border border-gray-400 shadow-sm"
            >
              <div className="text-xs p-0 m-0 -top-1 left-0 absolute">
                {value}
                <span className={isRed ? "text-red-600" : "text-black"}>
                  {suit}
                </span>
              </div>
              <span
                className={cn(
                  "py-1 text-2xl border h-10 w-10 border-black",
                  isRed ? "text-red-600" : "text-black"
                )}
              >
                {card}
              </span>
              <div className="text-xs p-0 m-0 -bottom-1 right-0 absolute rotate-180">
                {value}
                <span className={isRed ? "text-red-600" : "text-black"}>
                  {suit}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-green-950/30 to-black" />
      <div className="pointer-events-none fixed inset-0 bg-black/40" />

      <div className="relative z-10 flex h-screen items-center justify-center">
        <LoginDesk />
      </div>
    </div>
  );
}
