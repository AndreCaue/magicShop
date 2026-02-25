import api from "../../axiosInstance";

type TPaymentCard = {
  order_uuid: number;
  payment_token: string;
  installments: number;
  name_on_card: string;
};

type TPaymenteResponse = {
  success: boolean;
  data: {
    order_uuid: number;
    charge_id: number;
    status: string;
    installments: number;
    total: number;
    payment: "credit_card";
  };
};

export const paymentCard = async ({
  installments,
  order_uuid,
  payment_token,
  name_on_card,
}: TPaymentCard) => {
  const response = await api.post<TPaymenteResponse>("/payment/card/one-step", {
    installments,
    order_uuid,
    payment_token,
    name_on_card,
  });

  return response.data;
};

type TInstallmentsParams = {
  brand: string;
  total_value: number | undefined;
};

export type TInstallment = {
  has_interest: boolean;
  installment: number;
  installment_value: number;
  interest_percentage: number;
  total_value: number;
};

type TInstallmentsResponse = {
  installments: TInstallment[];
  success: boolean;
};

export const getInstallments = async ({
  brand,
  total_value,
}: TInstallmentsParams) => {
  try {
    const response = await api.post<TInstallmentsResponse>(
      "/payment/card/installments",
      {
        brand,
        total_value,
      },
    );

    if (!response.data.success) return;

    return response.data;
  } catch (err) {
    console.log(err, "error");
    return undefined;
  }
};

type TCreatePix = {
  expiracao?: number;
  order_uuid: number;
};

export interface IPixDataResponse {
  charge_id: number;
  imagem_qrcode: string | null;
  location: string;
  pix_copia_e_cola: string;
  txid: string;
}

interface IPixResponse {
  success: true;
  data: IPixDataResponse;
  message?: string;
}
export const createPix = async (params: TCreatePix) => {
  try {
    const response = await api.post<IPixResponse>("/payment/pix", {
      ...params,
    });

    return response.data;
  } catch (error) {
    console.log(error, "Falha ao gerar Pix", error);
  }
};
