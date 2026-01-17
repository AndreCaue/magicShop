import { PageContainer } from "@/Pages/Home/Components/PageContainer";
import { ItemList } from "./Components/ItemList";
import blueBy from "../../../assets/BicycleBlue.png";
import bluebyDec from "../../../assets/blue-bicycle-decline.png";
import AnimatedTitle from "@/components/new/AnimatedTitle";

const mockImages = {
  data: [
    {
      img: [blueBy, bluebyDec],
      price: 12,
      title: "Baralho Bicycle Standard BLACK",
    },
    {
      img: [blueBy, bluebyDec],
      price: 40,
      title: "Baralho Bicycle Standard BLUE",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard BLACK",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
    {
      img: [blueBy, bluebyDec],
      price: 30,
      title: "Baralho Bicycle Standard RED",
    },
  ],
};

export const Bicycle = () => {
  const titleBasedOnUrl = window.location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  return (
    <PageContainer>
      <div className="grid border max-h-screen py-5 px-20">
        <AnimatedTitle
          text={titleBasedOnUrl}
          level="h1"
          size="large"
          align="center"
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          {mockImages.data.length > 0 &&
            mockImages.data.map((item, index) => (
              <ItemList key={index} items={item} />
            ))}
        </div>
      </div>
    </PageContainer>
  );
};
