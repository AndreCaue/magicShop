import api from "../../axiosInstance";

type T = {
  params: any;
};

export const paymentCard = async (params: any) => {
  const response = await api.post("/payment/card/one-step", { ...params });

  return response;
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
