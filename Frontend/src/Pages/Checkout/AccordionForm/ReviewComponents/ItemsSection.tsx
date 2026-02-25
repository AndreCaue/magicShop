import type { CartItem } from "@/global/cart";

type TItemsSection = {
  items: CartItem[];
};

export const ItemsSection = ({ items }: TItemsSection) => {
  return (
    <section className="px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-900">Itens do pedido</h3>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            {item.product_image_urls && (
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={item.product_image_urls[0]}
                  alt={item.product_image_urls[0]}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product_name}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Qtd: {item.quantity} × R${" "}
                {item.unit_price.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <div className="text-right text-sm font-medium text-gray-900">
              R$ {item.total_price.toFixed(2).replace(".", ",")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
