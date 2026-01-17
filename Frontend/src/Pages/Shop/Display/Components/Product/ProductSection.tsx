import { motion } from "framer-motion";

const cardMotion = {
  rest: {
    y: 20,
    opacity: 0.4,
    scale: 0.94,
    rotateX: 8,
    transition: { duration: 0.9, ease: "easeOut" },
  },
  hover: {
    y: -16,
    opacity: 1,
    scale: 1.04,
    rotateX: 0,
    rotateY: 4,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
} as const;

const glowMotion = {
  rest: { opacity: 0 },
  hover: { opacity: 0.35, scale: 1.3, transition: { duration: 1.1 } },
};

type TBrandSectionProps = {
  products: IProduct[];
};

export const ProductSection = ({ products }: TBrandSectionProps) => {
  return (
    <section className="py-24 md:py-32">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.4 }}
        className="text-3xl md:text-4xl font-light tracking-widest text-white/90 text-center mb-16 md:mb-24"
      >
        {products[0]?.category?.name}
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20 max-w-6xl mx-auto px-6">
        {products?.map((product) => (
          <motion.div
            key={product.id}
            className="group relative perspective-[1400px]"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <motion.div
              variants={glowMotion}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/20 via-transparent to-fuchsia-600/10 pointer-events-none"
            />

            <motion.div
              variants={cardMotion}
              className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
                <motion.img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              <div className="p-6 text-center space-y-4">
                <h3 className="text-lg font-light text-white/90 tracking-wide min-h-[2.8em]">
                  {product.name}
                </h3>

                <div className="text-2xl font-light text-white">
                  R$ {product.price.toFixed(2)}
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 text-sm uppercase tracking-widest text-purple-300/80 hover:text-purple-200 transition-colors duration-300"
                >
                  Adicionar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
