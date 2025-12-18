import { Package } from "lucide-react";
import React from "react";

type TImages = {
  product: IProduct;
};

export const Images = ({ product }: TImages) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {product.image_urls?.[0] && (
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
            <img
              src={product.image_urls[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        {product.image_urls?.[1] ? (
          <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
            <img
              src={product.image_urls[1]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {product.image_urls?.length > 2 && (
        <div className="flex gap-2">
          {product.image_urls.slice(2, 5).map((img, i) => (
            <button
              key={i}
              className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200"
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
