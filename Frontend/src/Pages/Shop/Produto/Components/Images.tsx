import { useState } from "react";
import { Package } from "lucide-react";

type TImages = {
  product: IProduct;
};

export const Images = ({ product }: TImages) => {
  const images = product.image_urls || [];
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-auto overflow-hidden rounded-3xl bg-gray-50 group">
        {activeImage ? (
          <img
            src={activeImage}
            alt={product.name}
            className="h-[400px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Package className="w-16 h-16" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5 rounded-3xl" />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.slice(0, 5).map((img, i) => {
            const isActive = img === activeImage;

            return (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`
                  relative h-20 w-20 overflow-hidden rounded-xl
                  transition-all duration-300
                  ${
                    isActive
                      ? "ring-2 ring-black scale-[1.02]"
                      : "ring-1 ring-black/10 opacity-70 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
