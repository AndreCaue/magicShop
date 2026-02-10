import Maze from "./Maze";

const START_ROW = 8;
const START_COL = 1;
const END_ROW = 8;
const END_COL = 13;

const PATH = [
  [8, 3],
  [7, 3],
  [6, 3],
  [5, 3],
  [4, 3],
  [3, 3],
  [2, 3],
  [1, 3],

  [8, 5],
  [7, 5],
  [6, 5],
  [5, 5],
  [4, 5],
  [3, 5],
  [2, 5],
  [1, 5],
  [7, 6],
  [7, 7],
  [6, 7],
  [5, 7],
  [4, 7],
  [3, 7],
  [2, 7],
  [1, 7],

  [8, 9],
  [7, 9],
  [6, 9],
  [5, 9],
  [4, 9],
  [3, 9],
  [2, 9],
  [1, 9],

  [8, 7],
  [1, 7],
  [1, 8],
  [1, 9],
  [1, 10],

  [8, 1],
  [8, 2],
  [8, 10],
  [8, 11],
  [8, 13],
  [8, 12],

  [6, 2],
  [5, 2],
  [1, 4],
  [3, 7],
  [2, 7],
  [6, 9],
];

export const TheWholeOfAParte = () => {
  return (
    <>
      <Maze
        END_COL={END_COL}
        END_ROW={END_ROW}
        PATH={PATH}
        START_COL={START_COL}
        START_ROW={START_ROW}
        goTo="escondido-esta"
      />
    </>
  );
};
