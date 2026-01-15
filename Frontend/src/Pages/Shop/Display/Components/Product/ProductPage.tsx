import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { ProductSection } from "./ProductSection";
import type { TBrandsTab } from "../../types";
import { productsByBrand } from "../../mocks";

type TProductPage = {
  selectedBrand: string;
  brands: TBrandsTab[];
};

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};
const pageTransition = {
  duration: 0.6,
  ease: easeInOut,
};

export const ProductPage = ({ selectedBrand, brands }: TProductPage) => {
  const currentProduct =
    productsByBrand[selectedBrand as keyof typeof productsByBrand];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedBrand}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <ProductSection
          brand={brands.find((b) => b.id === selectedBrand)?.name || "Unknown"}
          products={currentProduct}
        />
      </motion.div>
    </AnimatePresence>
  );
};
