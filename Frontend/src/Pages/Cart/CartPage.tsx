import { Link } from "react-router-dom";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import CartEmpty from "./CartEmpty";
import { useCart } from "@/Hooks/useCart";

export default function CartPage() {
  const { items, totalItems } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 pt-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
          </h1>
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Continuar comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.variant}`} item={item} />
              ))}
            </div>

            <div className="lg:sticky lg:top-6 h-fit">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
