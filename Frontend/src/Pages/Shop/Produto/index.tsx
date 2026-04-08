import { NewButton } from "@/components/new/NewButton";
import QuantitySelector from "@/components/new/QuantitySelector";
import { PageContainer } from "@/Pages/Home/Components/PageContainer";
import { getProductById } from "@/Repositories/shop/getters";
import { ShoppingCart, Truck, CreditCard, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Images } from "./Components/Images";
import { useCart } from "@/Hooks/useCart";
import { SymbolLoading } from "@/components/new/CustomLoading/SymbolLoading";

export const IndividualProduct = () => {
  const [product, setProduct] = useState<IProduct>({} as IProduct);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      if (!id) return;
      const res = await getProductById(Number(id));
      setProduct(res);
    })();
  }, [id]);

  const handleAddCart = () => {
    if (quantity < 1) return toast.error("Selecione a quantidade");

    setIsLoading(true);
    addToCart({ product_id: product.id, quantity });
    setIsLoading(false);
  };

  const handleBuyNow = () => {
    addToCart({ product_id: product.id, quantity });
    if (quantity < 1) return toast.error("Selecione a quantidade");
    navigate("/checkout");
  };

  if (!product?.id) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse text-muted-foreground">
            <SymbolLoading /> Carregando produto...
          </div>
        </div>
      </PageContainer>
    );
  }
  const parcelas = Math.floor(product.price / 10) || 1;

  const hasValidStock = product.stock > product.reserved_stock;
  const remainStock = product.stock - product.reserved_stock;

  return (
    <div className="max-w-7xl mx-auto px-4 py-30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Images product={product} />

        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-400">
                {product.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Vendidos: {product.reserved_stock} - • Em estoque: {remainStock}{" "}
                unidades
              </p>
            </div>

            <div className="border-b pb-6">
              <div className="text-4xl font-bold text-slate-200">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                até <b className="text-slate-200">{parcelas}x</b> no cartão.
              </p>
              <p className="text-sm text-muted-foreground mt-2 flex gap-2">
                <Info size={20} /> valor mínimo da parcela 10 reais.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-400">
                  Quantidade:
                </span>
                <QuantitySelector
                  maxQuantity={remainStock}
                  getQuantity={setQuantity}
                  initialValue={quantity}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <NewButton
                label="Comprar agora"
                onClick={handleBuyNow}
                disabled={isLoading || product.stock === 0 || !hasValidStock}
                className="h-10 text-lg font-semibold"
              />
              <NewButton
                label="Adicionar ao carrinho"
                icon={<ShoppingCart className="w-5 h-5" />}
                onClick={handleAddCart}
                disabled={isLoading || product.stock === 0 || !hasValidStock}
                className="h-10 text-lg onclick:animate-bounce"
              />
            </div>

            <div className="space-y-3 pt-6 border-t text-sm text-muted-foreground">
              {/* <div className="flex items-center gap-3">
                <Truck className="w-5 h-5" /> 
                <span className="flex gap-2">  # FEATURE
                  Frete grátis acima de
                  <p className="text-green-500">R$100</p>{" "}
                </span>
              </div> */}
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <span>
                  Parcele até em <b className="text-green-400">3x</b> sem
                  juros{" "}
                </span>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mt-10 pt-8 border-t">
              <h3 className="font-semibold text-slate-400 text-lg mb-3">
                Descrição
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
