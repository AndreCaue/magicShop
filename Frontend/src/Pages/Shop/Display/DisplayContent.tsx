import { useState } from "react";
import { DisplayFooter } from "./Components/DisplayFooter";
import { ProductPage } from "./Components/Product/ProductPage";
import { brands } from "./mocks";
import { DisplayBackground } from "./Components/DisplayBackground";
import { DisplayHeader } from "./Components/DisplayHeader";
import { CategoryTab } from "./Components/Product/CategoryTab";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface IDisplayContext {
  title: string;
  subTitle: string;
  // brandsExample?: any[];
}

const DisplayContent = ({ title, subTitle }: IDisplayContext) => {
  const [selectedBrand, setSelectedBrand] = useState("bicycle");
  const { open } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden mt-20">
      <DisplayBackground />

      <div
        className={cn(
          "relative max-w-7xl mx-auto px-4 py-20",
          open ? "z-0" : "z-10"
        )}
      >
        <DisplayHeader title={title} subTitle={subTitle} />

        <CategoryTab
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          brands={brands} // brandsExample
        />
        <ProductPage
          brands={brands} // brandsExample
          selectedBrand={selectedBrand}
        />
        <DisplayFooter />
      </div>
    </div>
  );
};

export default DisplayContent;
