"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const weaponsData = (0, _1.loadData)("./weapons_data.json");
const weapon_types = Object.keys(weaponsData);
for (let weapon_type in weapon_types) {
    Object.entries(weaponsData.data[weapon_type]).map(([key, skins]) => {
        console.log(`key ${key}`);
        console.log(`skins ${skins}`);
    });
}
