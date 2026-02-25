import { CheckCircle2 } from "lucide-react";

type TReviewTitle = {
  title: string;
  subTitle: string;
};

export const ReviewTitle = ({ subTitle, title }: TReviewTitle) => {
  return (
    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/40 text-center">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 justify-center">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500">{subTitle}</p>
    </div>
  );
};
