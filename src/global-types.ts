export interface Sticker {
  name: string;
  img: string;
}

export interface StickersData {
  [collectionName: string]: Sticker[];
}
