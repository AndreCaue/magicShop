import { useMemo, useState } from "react";
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
  productData: IProduct[];
}

const DisplayContent = ({ title, subTitle, productData }: IDisplayContext) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { open } = useSidebar();

  const categoryTab = useMemo(() => {
    const tabs = Array.from(
      new Map(
        productData.map((item) => [item.category.id, item.category]),
      ).values(),
    );
    setSelectedCategory(tabs[0]?.name);

    return tabs;
  }, [productData]);

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
        <ProductPage selectedCategory={selectedCategory} data={productData} />
        <DisplayFooter />
      </div>
    </div>
  );
};

export default DisplayContent;
