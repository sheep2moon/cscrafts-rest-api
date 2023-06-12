export interface Sticker {
  name: string;
  img_src: string;
}

export interface StickersData {
  [collectionName: string]: Sticker[];
}

export interface WeaponSkin {
  name: string;
  img_src: string;
}

export interface WeaponsData {
  [weaponType: string]: {
    [weaponName: string]: {
      img_src: string;
      data: WeaponSkin[];
    };
  };
}

export type Craft = {
  weapon: string;
  exteriors: number[];
  stickers: Array<Sticker | null>;
  exterior_tag: string;
};

export type CraftSearchResult = {
  name: string;
  price: string;
  img_src: string;
};
