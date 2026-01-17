import { useState } from "react";
import { DisplayFooter } from "./Components/DisplayFooter";
import { ProductPage } from "./Components/Product/ProductPage";
import { DisplayBackground } from "./Components/DisplayBackground";
import { DisplayHeader } from "./Components/DisplayHeader";
import { CategoryTab } from "./Components/Product/CategoryTab";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
export interface IDisplayContext {
  title: string;
  subTitle: string;
  rawData: IProduct[];
}

const DisplayContent = ({ title, subTitle, rawData }: IDisplayContext) => {
  const [selectedCategory, setSelectedCategory] = useState("Bicycle");
  const { open } = useSidebar();

  const categoryTab = rawData.map((item) => ({
    ...item.category,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden mt-20">
      <DisplayBackground />

      <div
        className={cn(
          "relative max-w-7xl mx-auto px-4 py-20",
          open ? "z-0" : "z-10",
        )}
      >
        <DisplayHeader title={title} subTitle={subTitle} />

        <CategoryTab
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          category={categoryTab}
        />
        <ProductPage selectedCategory={selectedCategory} data={rawData} />
        <DisplayFooter />
      </div>
    </div>
  );
};

export default DisplayContent;
