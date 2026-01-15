import React, { useState } from "react";
import { DisplayFooter } from "./Components/DisplayFooter";
import { ProductPage } from "./Components/Product/ProductPage";
import { brands } from "./mocks";
import { DisplayBackground } from "./Components/DisplayBackground";
import { DisplayHeader } from "./Components/DisplayHeader";
import { CategoryTab } from "./Components/Product/CategoryTab";

export interface IDisplayContext {
  title: string;
  subTitle: string;
  // brandsExample?: any[];
}

const DisplayContent = ({ title, subTitle }: IDisplayContext) => {
  const [selectedBrand, setSelectedBrand] = useState("bicycle");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden mt-20">
      <DisplayBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
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
