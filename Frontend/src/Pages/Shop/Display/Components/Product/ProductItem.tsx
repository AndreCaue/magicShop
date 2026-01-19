import { motion } from "framer-motion";
import { cardMotion, glowMotion } from "../../helper";
import { useLocation, useNavigate } from "react-router-dom";

type TProductItem = {
  id: number;
  image: string;
  name: string;
  price: number;
  discount: number;
};

export const ProductItem = ({
  id,
  image,
  name,
  price,
  discount,
}: TProductItem) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.div
      key={id}
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
        className="bg-neutral-900/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shadow-2xl cursor-pointer"
        onClick={() => navigate(`${location.pathname}/product/${id}`)}
      >
        <div className="aspect-[3/4] relative overflow-hidden bg-black/40">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        {discount && (
          <span className="absolute top-5 -right-3 rotate-45 w-24 h-6 text-center bg-green-500 text-white">
            Ganhe R${discount}{" "}
            <p className="bg-white text-green-500">NO FRETE</p>
          </span>
        )}

        <div className="p-6 text-center space-y-4">
          <h3 className="text-lg font-light text-white/90 tracking-wide min-h-[2.8em]">
            {name}
          </h3>

          <div className="text-2xl font-light text-white">
            R$ {price.toFixed(2)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
