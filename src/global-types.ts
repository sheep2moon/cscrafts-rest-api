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
