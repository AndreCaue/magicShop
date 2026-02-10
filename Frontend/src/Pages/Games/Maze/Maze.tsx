import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const CELL_SIZE = 35;

// 🟡 Ponto inicial (amarelo da imagem)
// const START_ROW = 5;
// const START_COL = 1;

// 🏁 Final do trajeto principal
// const END_ROW = 8; // mudar
// const END_COL = 14;

// Caminho jogável (formato da imagem)
// const LETTER_POSITIONS = [[0, 5]];

// const MAZE = (() => {
//   const m = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
//   LETTER_POSITIONS.forEach(([r, c]) => {
//     if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
//       m[r][c] = 0;
//     }
//   });
//   return m;
// })();

type TMaze = {
  PATH: number[][];
  END_ROW: number;
  END_COL: number;
  START_ROW: number;
  START_COL: number;
  goTo: string;
  ROWS?: number;
  COLS?: number;
};

function Maze({
  END_COL,
  END_ROW,
  PATH,
  START_COL,
  START_ROW,
  goTo,
  COLS = 15,
  ROWS = 10,
}: TMaze) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [player, setPlayer] = useState({ row: START_ROW, col: START_COL });
  const [lastPos, setLastPos] = useState(null);
  const [visited, setVisited] = useState(() => {
    const v = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    v[START_ROW][START_COL] = true;
    return v;
  });

  const MAZE = useMemo(() => {
    const m = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
    PATH.forEach(([r, c]) => {
      m[r][c] = 0;
    });
    return m;
  }, []);

  const [completed, setCompleted] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paredes
    ctx.fillStyle = "#1a1a1a";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (MAZE[r][c] === 1) {
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Caminho percorrido
    ctx.fillStyle = "#4a0000";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (visited[r][c]) {
          ctx.fillRect(
            c * CELL_SIZE + 2,
            r * CELL_SIZE + 2,
            CELL_SIZE - 4,
            CELL_SIZE - 4,
          );
        }
      }
    }

    // Jogador
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      player.col * CELL_SIZE + CELL_SIZE / 2,
      player.row * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Borda ao completar
    if (completed) {
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      navigate(`/jogos/${goTo}`);
    }
  }, [player, visited, completed, navigate]);

  useEffect(() => draw(), [draw]);

  useEffect(() => {
    if (completed) return;

    const reachedEnd = player.row === END_ROW && player.col === END_COL;

    if (reachedEnd) {
      setCompleted(true);
    }
  }, [player, visited, completed]);

  const handleKeyDown = useCallback(
    (e) => {
      if (completed) return;

      e.preventDefault();

      const dirMap = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const [dr, dc] = dirMap[e.key] || [0, 0];
      if (dr === 0 && dc === 0) return;

      const nr = player.row + dr;
      const nc = player.col + dc;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || MAZE[nr][nc] === 1)
        return;

      // 🚫 Impede regredir no PRIMEIRO movimento
      if (!lastPos && nr === 5 && nc === 0) return;

      setLastPos({ row: player.row, col: player.col });
      setPlayer({ row: nr, col: nc });
      setVisited((prev) => {
        const next = prev.map((row) => [...row]);
        next[nr][nc] = true;
        return next;
      });
    },
    [player, completed, lastPos],
  );

  const handleReset = useCallback((e) => {
    if (e.key.toLowerCase() === "r") {
      setPlayer({ row: START_ROW, col: START_COL });
      setLastPos(null);
      const newVisited = Array.from({ length: ROWS }, () =>
        Array(COLS).fill(false),
      );
      newVisited[START_ROW][START_COL] = true;
      setVisited(newVisited);
      setCompleted(false);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.focus();
      container.addEventListener("keydown", handleKeyDown);
    }
    window.addEventListener("keydown", handleReset);

    return () => {
      if (container) container.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleReset);
    };
  }, [handleKeyDown, handleReset]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex flex-col items-center justify-center min-h-screen bg-black outline-none"
    >
      <canvas
        ref={canvasRef}
        width={COLS * CELL_SIZE}
        height={ROWS * CELL_SIZE}
        className="border border-gray-900"
      />
    </div>
  );
}

export default Maze;
