import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TBrandsTab } from "../../types";
import { HatGlasses, Star } from "lucide-react";
import { GiPokerHand } from "react-icons/gi";

type TCategoryTab = {
  setSelectedBrand: React.Dispatch<React.SetStateAction<string>>;
  selectedBrand: string;
  brands: TBrandsTab[];
};

export const CategoryTab = ({
  selectedBrand,
  brands,
  setSelectedBrand,
}: TCategoryTab) => {
  const brandIcon: Record<string, React.JSX.Element> = {
    heart: (
      <span
        className={cn(
          "text-red-500",
          selectedBrand === "bicycle" && "text-white"
        )}
      >
        ♥
      </span>
    ),
    hatGlasses: <HatGlasses className="text-white" />,
    star: <Star className="fill-black" />,
    pokerHand: <GiPokerHand />,
  };

  return (
    <motion.div
      className="flex justify-center gap-4 mb-16 flex-wrap"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {brands.map((brand) => (
        <motion.button
          key={brand.id}
          onClick={() => setSelectedBrand(brand.id)}
          className={cn(
            "relative px-8 py-5 rounded-2xl font-bold text-lg transition-all",
            selectedBrand === brand.id
              ? "text-white shadow-2xl"
              : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 backdrop-blur-sm"
          )}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          {selectedBrand === brand.id && (
            <motion.div
              layoutId="brandBackground"
              className={cn(
                "absolute inset-0 bg-gradient-to-r rounded-2xl",
                brand.color
              )}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span
            className={cn(
              "relative z-10 flex items-center gap-2",
              brand.nameStyle
            )}
          >
            <span className="text-3xl">{brandIcon[brand.icon]}</span>
            {brand.name}
          </span>
          {selectedBrand === brand.id && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className={cn("text-2xl rotate-180", brand.selectorColor)}>
                ♠
              </div>
            </motion.div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};
