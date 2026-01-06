import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/Hooks/useCart";

export default function CartItem({ item }: any) {
  const { updateQuantity, removeFromCartAction, isFetching, isMutating } =
    useCart();

  const total = item.unit_price * item.quantity;

  return (
    <>
      {isFetching || isMutating ? (
        <>{<Skeleton className="h-48 w-full" />}</>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-6 hover:shadow-md transition">
          <img
            src={item.product_image_urls}
            alt={item.name}
            className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
          />

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
            {item.variant && (
              <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-10 h-10 rounded-full border hover:bg-gray-50 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <span className="w-16 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-10 h-10 rounded-full border hover:bg-gray-50 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              R$ {total.toFixed(2).replace(".", ",")}
            </p>
            <button
              onClick={() => removeFromCartAction(item.id)}
              className="text-red-600 hover:text-red-800 text-sm mt-4 flex items-center gap-1 cursor-pointer"
            >
              Remover
            </button>
          </div>
        </div>
      )}
    </>
  );
}
