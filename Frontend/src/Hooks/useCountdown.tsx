import { useCallback, useEffect, useRef, useState } from "react";

export function useCountdown(initialSeconds: number) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setCount(initialSeconds);

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    setCount(0);
  }, []);

  useEffect(() => {
    return () => clearInterval(intervalRef.current!);
  }, []);

  return {
    count,
    isCounting: count > 0,
    start,
    reset,
  };
}
