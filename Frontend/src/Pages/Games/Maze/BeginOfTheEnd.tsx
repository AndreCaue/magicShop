// import { useState, useCallback, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
import Maze from "./Maze";

// const ROWS = 10;
// const COLS = 15;
// const CELL_SIZE = 35;
const START_ROW = 1;
const START_COL = 3;
const END_ROW = 1;
const END_COL = 11;

const PATH = [
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [5, 3],
  [6, 3],
  [7, 3],
  [8, 3],

  [8, 4],
  [8, 5],
  [8, 6],
  [8, 7],
  [8, 8],
  [8, 9],
  [8, 10],
  [8, 11],

  [1, 11],
  [2, 11],
  [3, 11],
  [4, 11],
  [5, 11],
  [6, 11],
  [7, 11],

  [4, 4],
  [4, 5],
  [7, 6],
  [6, 6],
  [5, 10],
  [5, 9],
  [7, 9],
  [6, 9],
  [2, 2],
  [2, 1],
];

export const TheBeginOfTheEnd = () => {
  return (
    <>
      <Maze
        END_COL={END_COL}
        END_ROW={END_ROW}
        PATH={PATH}
        START_COL={START_COL}
        START_ROW={START_ROW}
        goTo="o-todo-de-uma-parte"
      />
    </>
  );
};

// export default TheBeginOfTheEnd;
