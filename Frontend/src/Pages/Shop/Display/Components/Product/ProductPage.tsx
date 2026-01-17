import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { ProductSection } from "./ProductSection";

type TProductPage = {
  selectedCategory: string;
  data: IProduct[];
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

export const ProductPage = ({ selectedCategory, data }: TProductPage) => {
  const currentProduct = data.filter(
    (prod) => prod.category.name === selectedCategory,
  );

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={selectedCategory}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <ProductSection products={currentProduct} />
      </motion.div>
    </AnimatePresence>
  );
};
