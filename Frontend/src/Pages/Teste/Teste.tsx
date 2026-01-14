import { motion } from "framer-motion";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type BrandSectionProps = {
  brand: string;
  products: Product[];
};

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

export function BrandSection({ brand, products }: BrandSectionProps) {
  return (
    <section className="py-24 md:py-32">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.4 }}
        className="text-3xl md:text-4xl font-light tracking-widest text-white/90 text-center mb-16 md:mb-24"
      >
        {brand}
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-20 max-w-6xl mx-auto px-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            className="group relative perspective-[1400px]"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            {/* brilho mágico sutil */}
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
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
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
}

// Página principal (exemplo)
export default function MinimalMagicStore() {
  const sampleTheory11 = [
    {
      id: "1",
      name: "Artisan",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
    {
      id: "2",
      name: "Monarchs",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
    },
    // ...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,#7c3aed20_0%,transparent_50%)]" />
      </div>

      <div className="relative pt-32 pb-40">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6 }}
          className="text-5xl md:text-7xl font-thin tracking-[0.15em] text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-purple-300/60"
        >
          M A G I C
        </motion.h1>

        <BrandSection brand="Theory11" products={sampleTheory11} />
        {/* <BrandSection brand="Ellusionist" products={...} /> */}
      </div>
    </div>
  );
}
