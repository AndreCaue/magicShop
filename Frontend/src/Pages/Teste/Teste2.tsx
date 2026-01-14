import { useState } from "react";
import { motion, easeInOut } from "framer-motion";
import { Sparkles, Award } from "lucide-react";
import { BrandSection } from "./Teste";

const MagicBrandDisplay = () => {
  const [selectedBrand, setSelectedBrand] = useState("bicycle");

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
  ];

  const brands = [
    {
      id: "bicycle",
      name: "Bicycle",
      icon: "🎴",
      color: "from-blue-600 to-blue-800",
      accentColor: "blue",
    },
    {
      id: "theory11",
      name: "Theory11",
      icon: "👑",
      color: "from-purple-600 to-purple-800",
      accentColor: "purple",
    },
    {
      id: "ellusionist",
      name: "Ellusionist",
      icon: "🎩",
      color: "from-red-600 to-red-800",
      accentColor: "red",
    },
    {
      id: "madison",
      name: "Madison",
      icon: "💎",
      color: "from-emerald-600 to-emerald-800",
      accentColor: "emerald",
    },
  ];

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: easeInOut,
    }, // parei aqui, mudar a tab
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              rotate: [null, Math.random() * 360 + 360],
              opacity: [0.1, 0.05, 0.1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div animate={floatingAnimation} className="inline-block">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent">
              Coleção Mágica
            </span>
          </h1>
          <p className="text-gray-300 text-xl">
            Escolha a marca e descubra o baralho perfeito
          </p>
        </motion.div>

        {/* Brand Selector */}
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
              className={`relative px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
                selectedBrand === brand.id
                  ? "text-white shadow-2xl"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 backdrop-blur-sm"
              }`}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              {selectedBrand === brand.id && (
                <motion.div
                  layoutId="brandBackground"
                  className={`absolute inset-0 bg-gradient-to-r ${brand.color} rounded-2xl`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-3xl">{brand.icon}</span>
                {brand.name}
              </span>
              {selectedBrand === brand.id && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="text-4xl rotate-180">♠</div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>
        <BrandSection brand="Theory11" products={sampleTheory11} />

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Award className="w-5 h-5" />
            Todos os produtos são originais e com garantia
            <Award className="w-5 h-5" />
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default MagicBrandDisplay;
