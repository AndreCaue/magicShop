import { MainGames } from "@/Pages/Games/main";
import { Route, Routes } from "react-router-dom";
import { TheOtherHalf } from "@/Pages/Games/Maze/TheOtherHalf";
import { TheBeginOfTheEnd } from "@/Pages/Games/Maze/BeginOfTheEnd";
import { TheWholeOfAParte } from "@/Pages/Games/Maze/TheWholeOfAPart";
import { HiddenItIs } from "@/Pages/Games/Maze/HiddenItIs";
import { HalfIsHere } from "@/Pages/Games/Maze/HalfIsHere";
import { OClock } from "@/Pages/Games/Maze/OCloak";

export const Games = () => {
  return (
    <Routes>
      <Route element={<MainGames />} path="" />
      <Route element={<TheBeginOfTheEnd />} path="o-inicio-do-fim" />
      <Route element={<TheWholeOfAParte />} path="o-todo-de-uma-parte" />
      <Route element={<HiddenItIs />} path="escondido-esta" />
      <Route element={<HalfIsHere />} path="metade-esta-aqui" />
      <Route element={<TheOtherHalf />} path="a-outra-metade" />
      <Route element={<OClock />} path="o-clock" />
    </Routes>
  );
};
