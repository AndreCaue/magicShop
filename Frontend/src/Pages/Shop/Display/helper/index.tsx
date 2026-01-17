const categoryStyles: Record<
  string,
  {
    icon: string;
    color: string;
    nameStyle: string;
    selectorColor: string;
  }
> = {
  Bicycle: {
    icon: "heart",
    color: "from-red-600 to-red-800 cursor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-black",
  },
  Gimmick: {
    icon: "hatGlasses",
    color: "from-black/50 to-black/80 cursor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-red-500",
  },
  Coleção: {
    icon: "star",
    color: "from-red-600 to-red-800 cursor-pointer",
    nameStyle: "cursor-pointer",
    selectorColor: "text-black",
  },
  Cardistry: {
    icon: "pokerHand",
    color: "from-black/50 to-black/80",
    nameStyle: "",
    selectorColor: "",
  },
};

export default categoryStyles;
