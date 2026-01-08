import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MobileForgotLink() {
  return (
    <motion.div
      whileTap={{
        scale: 0.96,
        opacity: 0.7,
        filter: "blur(1.5px)",
      }}
      transition={{
        duration: 0.15,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <Link to="/forgot_password" className="text-white text-center block">
        Esqueceu sua senha ?
      </Link>
    </motion.div>
  );
}
