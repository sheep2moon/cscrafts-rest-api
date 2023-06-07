import { loadData } from ".";
import { WeaponsData } from "./global-types";

const weaponsData: { data: WeaponsData } = loadData("./weapons_data.json");

const weapon_types = Object.keys(weaponsData);

for (let weapon_type in weapon_types) {
  Object.entries(weaponsData.data[weapon_type]).map(([key, skins]) => {
    console.log(`key ${key}`);
    console.log(`skins ${skins}`);
  });
}
