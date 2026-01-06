export type CartItem = {
  id: string;
  product_id: string;
  product_image_urls: string;
  unit_price: number;
  product_name: string;
  quantity: number;
  total_price: number;

  /** Dimensões e pesos */
  weight: number;
  width: number;
  length: number;
  height: number;

  /** Slug para linkar de volta à página do produto */
  slug: string;

  /** Preço original (para mostrar desconto/riscado) — opcional */
  compareAtPrice?: number | null;

  /** Estoque disponível (útil para bloquear +) */
  availableStock: number;

  /** Variante selecionada (ex: "P", "Azul", "220V") */
  variant?: string | null;

  /** Opções da variante (ex: { Tamanho: "GG", Cor: "Preto" }) */
  variantOptions?: Record<string, string>;

  /** Metadados extras (ex: peso, dimensões, SKU) */
  sku?: string;
};

export type CartCoupon = {
  code: string;
  discountType: "percentage" | "fixed_amount" | "free_shipping";
  discountValue: number; // 10 = 10% ou R$10,00
  minimumAmount?: number;
};

export type CartShipping = {
  /** Valor do frete calculado (ou 0 se grátis) */
  amount: number;

  /** Nome do método (ex: "PAC", "SEDEX", "J146") */
  name: string;

  /** Prazo em dias úteis */
  estimatedDays: number;

  /** ID do método no parceiro (Correios, Melhor Envio, etc.) */
  serviceId?: string;
};

export type Cart = {
  /** ID do carrinho (útil para guest checkout) */
  id: string;

  /** Itens no carrinho */
  items: CartItem[];

  /** Cupom aplicado (ou null) */
  coupon: CartCoupon | null;

  /** Frete já calculado (pode ser null até o cliente informar CEP) */
  shipping: CartShipping | null;

  /** Subtotal dos itens (sem frete) */
  subtotal: number;

  /** Valor total de desconto (cupom + promoções) */
  discountTotal: number;

  /** Valor total final (subtotal - desconto + frete) */
  total: number;

  /** Quantidade total de itens (soma das quantidades) */
  totalItems: number;

  /** Data de criação/atualização */
  createdAt: string;
  updatedAt: string;

  /** Token para checkout guest (se não tiver login) */
  guestToken?: string;
};
