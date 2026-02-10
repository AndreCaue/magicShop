import Maze from "./Maze";

const START_ROW = 5;
const START_COL = 2;

const END_ROW = 5;
const END_COL = 12;

const PATH = [
  [1, 0],
  [1, 1],
  [1, 2],
];

// 19 19 17 17 15 15 13 13 11, usar relogio como instrução?
//19h 19h 17h 17h

export const OClock = () => {
  return (
    <>
      <Maze
        END_COL={END_COL}
        END_ROW={END_ROW}
        PATH={PATH}
        START_COL={START_COL}
        START_ROW={START_ROW}
        COLS={20}
        ROWS={20}
        goTo="/metade-esta-aqui"
      />
    </>
  );
};

// export default HiddenItIs;
