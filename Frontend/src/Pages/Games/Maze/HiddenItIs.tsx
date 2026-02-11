import Maze from "./Maze";

const START_ROW = 5;
const START_COL = 2;

const END_ROW = 5;
const END_COL = 12;

const PATH = [
  [5, 2],
  [5, 3],
  [5, 4],
  [5, 5],
  [5, 6],
  [5, 7],
  [5, 8],
  [5, 9],
  [5, 10],
  [5, 11],
  [5, 12],
];

export const HiddenItIs = () => {
  return (
    <>
      <Maze
        END_COL={END_COL}
        END_ROW={END_ROW}
        PATH={PATH}
        START_COL={START_COL}
        START_ROW={START_ROW}
        goTo="metade-esta-aqui"
      />
    </>
  );
};
