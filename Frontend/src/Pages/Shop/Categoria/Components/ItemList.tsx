type TItemList = {
  items: {
    img: string[];
    price: number;
    title: string;
  };
};

export const ItemList = ({ items }: TItemList) => {
  return (
    <div className="grid h-auto w-60 border border-red-500">
      <div className="flex justify-center p-2">
        {items.img.map((img, index) => (
          <img src={img} key={index} className="h-16 w-16 border" />
        ))}
      </div>
      <b className="text-white text-center">{items.title}</b>
      <span className="text-center text-blue-500">R${items.price}</span>
    </div>
  );
};
