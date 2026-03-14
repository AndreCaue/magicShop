import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const COLS = 3;
const ROWS = 3;
const TOTAL_CELLS = COLS * ROWS;
const DELAY_BETWEEN_FOLDS = 480;
const DELAY_AFTER_COMPLETE = 2000;

const SUITS = ["♠", "♥", "♦", "♣"];

export const TableLoading = () => {
  const [cycleKey, setCycleKey] = useState(0);

  const cellSymbols = useMemo(() => {
    const allSymbols: string[] = [];

    for (let r = 0; r < ROWS; r++) {
      const shuffled = [...SUITS].sort(() => Math.random() - 0.5);
      allSymbols.push(...shuffled);
    }

    return allSymbols;
  }, [cycleKey]);

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        if (step >= TOTAL_CELLS) {
          setCycleKey((prev) => prev + 1);
          setStep(0);
        } else {
          setStep((prev) => prev + 1);
        }
      },
      step === TOTAL_CELLS ? DELAY_AFTER_COMPLETE : DELAY_BETWEEN_FOLDS,
    );

    return () => clearTimeout(timer);
  }, [step, cycleKey]);

  const getCellPosition = (index: number) => {
    const zeroBased = index - 1;
    return {
      col: (zeroBased % COLS) + 1,
      row: Math.floor(zeroBased / COLS) + 1,
    };
  };

  const isRevealed = (col: number, row: number) => {
    if (step === 0) return false;
    if (step >= TOTAL_CELLS) return true;

    for (let i = 1; i <= step; i++) {
      const pos = getCellPosition(i);
      if (pos.col === col && pos.row === row) return true;
    }
    return false;
  };

  const getRevealOrigin = (col: number, row: number) => {
    if (!isRevealed(col, row)) return { originX: 0, originY: 0 };

    if (col === 1 && row === 1) return { originX: 0, originY: 0 };

    if (row === 1) return { originX: 0, originY: 0.5 };

    if (col === 1) return { originX: 0.5, originY: 0 };

    return { originX: 0, originY: 0.5 };
  };

  const getSymbolForCell = (col: number, row: number) => {
    const flatIndex = (row - 1) * COLS + (col - 1);
    return cellSymbols[flatIndex] || "•";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 md:p-12">
      <div
        className="grid gap-px bg-gray-800/70 p-2 rounded-2xl shadow-2xl border border-gray-700/60 overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: "min(50vw, 820px)",
          aspectRatio: `${COLS} / ${ROWS}`,
          maxWidth: "820px",
        }}
      >
        {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
          const rowIdx = Math.floor(idx / COLS);
          const colIdx = idx % COLS;
          const col = colIdx + 1;
          const row = rowIdx + 1;

          const revealed = isRevealed(col, row);
          const { originX, originY } = getRevealOrigin(col, row);
          const symbol = getSymbolForCell(col, row);

          const isRed = symbol === "♥" || symbol === "♦";

          return (
            <motion.div
              key={`${col}-${row}-${cycleKey}`}
              initial={false}
              animate={{
                scaleX: revealed ? 1 : 0,
                scaleY: revealed ? 1 : 0.04,
                opacity: revealed ? 1 : 0,
                rotateX: revealed ? 0 : 12,
              }}
              transition={{
                duration: 0.62,
                ease: [0.16, 1.0, 0.32, 1.02],
              }}
              style={{
                originX,
                originY,
                transformOrigin: `${originX * 100}% ${originY * 100}%`,
              }}
              className={`
                relative flex items-center justify-center
                text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter
                border border-gray-700/80
                ${revealed ? "bg-gray-900/90" : "bg-gray-950"}
                shadow-inner overflow-hidden
                before:content-[''] before:absolute before:inset-0
                before:bg-gradient-to-br before:from-white/5 before:to-transparent
                before:opacity-0 data-[revealed=true]:before:opacity-100
                transition-all duration-700
              `}
              data-revealed={revealed}
            >
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  className={`${isRed ? "text-red-500" : "text-white"} drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]`}
                >
                  {symbol}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
