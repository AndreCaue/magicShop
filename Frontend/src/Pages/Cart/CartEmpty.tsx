// src/components/cart/CartEmpty.tsx
import { Link } from "react-router-dom";

export default function CartEmpty() {
  return (
    <div className="text-center py-20">
      <div className="text-8xl text-gray-200 mb-6">Cart</div>
      <p className="text-2xl text-gray-600 mb-8">Seu carrinho está vazio</p>
      <Link
        to="/"
        className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-indigo-700 transition"
      >
        Voltar às compras
      </Link>
    </div>
  );
}
