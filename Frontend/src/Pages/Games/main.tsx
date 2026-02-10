import { PageContainer } from "@/Pages/Home/Components/PageContainer";
import { useNavigate } from "react-router-dom";

export const MainGames = () => {
  const navigate = useNavigate();

  return (
    <PageContainer className="ml-5">
      <div className="grid grid-cols-3 text-white border border-white w-full h-full">
        <div
          className="border border-red-500 justify-center cursor-pointer items-center flex"
          onClick={() => navigate("o-inicio-do-fim")}
        >
          Maze
        </div>
        <div>Maze</div>
        <div>Maze</div>
        <div>Maze</div>
        <div>Maze</div>
      </div>
    </PageContainer>
  );
};
