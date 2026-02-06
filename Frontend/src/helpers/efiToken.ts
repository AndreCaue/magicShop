declare global {
  interface Window {
    EfiPay: any;
  }
}

export function gerarTokenCard(card: {
  number: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  brand: string;
}) {
  const efipay = new window.EfiPay({
    publicKey: import.meta.env.VITE_EFI_PUBLIC_KEY,
    sandbox: true, // false em prod
  });

  return efipay.createPaymentToken(card);
}
