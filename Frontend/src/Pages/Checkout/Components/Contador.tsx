import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return {
      parts: [
        { value: String(h).padStart(2, "0"), label: "h" },
        { value: String(m).padStart(2, "0"), label: "m" },
        { value: String(s).padStart(2, "0"), label: "s" },
      ],
    };
  }
  return {
    parts: [
      { value: String(m).padStart(2, "0"), label: "m" },
      { value: String(s).padStart(2, "0"), label: "s" },
    ],
  };
}

function Digit({ value }: { value: number }) {
  return (
    <div className="relative w-8 h-10 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: 20, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="absolute text-2xl font-light tabular-nums"
          style={{ fontFamily: "'DM Mono', 'Fira Mono', monospace" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function TimePart({ value, label }: { value: string; label: string }) {
  const [d1, d2] = value.split("");
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-0.5">
        <Digit value={Number(d1)} />
        <Digit value={Number(d2)} />
      </div>
      <span className="text-[10px] uppercase tracking-widest opacity-30 font-medium">
        {label === "h" ? "hora" : label === "m" ? "min" : "seg"}
      </span>
    </div>
  );
}

type TContador = {
  initialSeconds: number;
  onExpire: () => void;
  className?: string;
  topLabel?: string;
  bottomLabel?: string;
};

export default function Contador({
  initialSeconds = 120,
  onExpire = () => {},
  className,
  topLabel,
  bottomLabel,
}: TContador) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const expired = seconds <= 0;

  useEffect(() => {
    if (expired) {
      onExpire();
      return;
    }
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [expired]);

  const { parts } = formatTime(seconds);

  const urgency = seconds < 60;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "flex flex-col items-center justify-center gap-8",
          className,
        )}
      >
        {topLabel && <span>{topLabel}</span>}

        <div>
          {/* Timer */}
          <div className="relative">
            {/* Glow de urgência */}
            <AnimatePresence>
              {urgency && !expired && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-2xl bg-red-500/10 blur-2xl"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={
                urgency && !expired
                  ? {
                      borderColor: [
                        "rgba(239,68,68,0.15)",
                        "rgba(239,68,68,0.4)",
                        "rgba(239,68,68,0.15)",
                      ],
                    }
                  : { borderColor: "rgba(255,255,255,0.06)" }
              }
              transition={{ duration: 1.5, repeat: urgency ? Infinity : 0 }}
              className="relative flex items-center gap-3 px-8  rounded-2xl border bg-white/[0.02] backdrop-blur-sm"
            >
              {expired ? (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-sm text-neutral-500 tracking-widest uppercase px-4"
                >
                  Reserva expirada
                </motion.span>
              ) : (
                parts.map((part) => (
                  <div key={part.label} className="flex items-center gap-3">
                    <TimePart value={part.value} label={part.label} />
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Barra de progresso */}
          {!expired && (
            <div className="w-48 h-px bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: urgency
                    ? "rgba(239,68,68,0.6)"
                    : "rgba(255,255,255,0.2)",
                }}
                initial={{ width: "100%" }}
                animate={{
                  width: `${(seconds / initialSeconds) * 100}%`,
                }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          )}

          {/* Aviso de urgência */}
          <AnimatePresence>
            {urgency && !expired && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-red-400/70 tracking-widest uppercase text-center"
              >
                Expirando em breve
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {bottomLabel && <span>{bottomLabel}</span>}
      </motion.div>
    </>
  );
}
