import type { TBrandsTab } from "./types";

export const productsByBrand = {
  bicycle: [
    {
      id: "b1",
      name: "Bicycle Rider Back",
      price: 29,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
    {
      id: "b2",
      name: "Bicycle Black Ghost",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
    },
    // adicione mais...
  ],
  gimmick: [
    {
      id: "t1",
      name: "Artisan",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    },
    {
      id: "t2",
      name: "Monarchs",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=800",
    },
    // adicione mais...
  ],
  collection: [
    {
      id: "e1",
      name: "Club 808",
      price: 89,
      image:
        "https://images.unsplash.com/photo-1540968221243-29f5d70540bf?w=800",
    },
    {
      id: "e2",
      name: "Black Lions",
      price: 109,
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af5929?w=800",
    },
  ],
  cardistry: [
    {
      id: "m1",
      name: "Madison Red",
      price: 69,
      image:
        "https://images.unsplash.com/photo-1607627143750-d86bc21e42bb?w=800",
    },
  ],
};

export const brands: TBrandsTab[] = [
  {
    id: "bicycle", // vem da request
    name: "Bicycle", // vem da request
    //   icon: <span className="text-red-500">♥</span>,
    icon: "heart", // add no map.
    color: "from-red-600 to-red-800 cur sor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-black",
  },
  {
    id: "gimmick",
    name: "Gimmick",
    //   icon: <HatGlasses className="text-white" />,
    icon: "hatGlasses",
    color: "from-black/50 to-black/80 cursor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-red-500",
  },
  {
    id: "collection",
    name: "Coleção",
    //   icon: <Star className="fill-black" />,
    icon: "star",
    color: " from-red-600 to-red-800 cursor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-black",
  },
  {
    id: "cardistry",
    name: "Cardistry",
    icon: "pokerHand",
    //   icon: <GiPokerHand />,
    color: "from-black/50 to-black/80",
    nameStyle: "",
    selectorColor: "",
  },
];
