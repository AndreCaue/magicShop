import { useState, useEffect } from "react";

const GRID_SIZE = 15;
const WALL = 1;
// const EMPTY = 0;

const initialMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function Maze() {
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [visited, setVisited] = useState(new Set(["1-1"]));

  useEffect(() => {
    const handleKeyDown = (e) => {
      let newX = playerPos.x;
      let newY = playerPos.y;

      if (e.key === "ArrowUp") newY--;
      if (e.key === "ArrowDown") newY++;
      if (e.key === "ArrowLeft") newX--;
      if (e.key === "ArrowRight") newX++;

      if (
        newX >= 0 &&
        newX < GRID_SIZE &&
        newY >= 0 &&
        newY < GRID_SIZE &&
        initialMaze[newY][newX] !== WALL
      ) {
        setPlayerPos({ x: newX, y: newY });
        setVisited((prev) => new Set(prev).add(`${newX}-${newY}`));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerPos]);

  return (
    <div className="flex flex-col items-center mt-10 font-sans">
      <h1 className="text-3xl font-bold mb-6">Labirinto - Seção 1</h1>

      <div className="inline-block border-4 border-gray-800 rounded-lg shadow-2xl">
        {initialMaze.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isVisited = visited.has(`${x}-${y}`);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`
                    w-8 h-8 border border-gray-400 box-border
                    ${cell === WALL ? "bg-gray-900" : "bg-white"}
                    ${isVisited && cell !== WALL ? "bg-red-300" : ""}
                    ${isPlayer ? "bg-red-500 border-4 border-black" : ""}
                  `}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center max-w-md">
        <p className="text-lg mb-2">
          Use as setas do teclado ↑ ← ↓ → para se mover.
        </p>
        <p className="text-gray-600">
          O caminho percorrido fica marcado em azul claro.
        </p>
      </div>
    </div>
  );
}

export default Maze;
