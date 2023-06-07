import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { Sticker, StickersData, WeaponSkin, WeaponsData } from "./global-types";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Load JSON data from file
export const loadData = (filename: string): any => {
  const jsonData = fs.readFileSync(path.resolve(__dirname, filename), "utf-8");
  return JSON.parse(jsonData);
};

const stickersData: { data: StickersData } = loadData("./stickers_data.json");
const weaponsData: { data: WeaponsData } = loadData("./weapons_data.json");

app.get("/sticker-collections", (req, res) => {
  const collectionNames = Object.keys(stickersData.data);
  res.json(collectionNames);
});
app.get("/sticker-collection", (req, res) => {
  const collectionName = req.query.collection_name as string;

  if (!collectionName) {
    res.status(400).json({ error: "Missing collection_name parameter" });
    return;
  }

  const collection = stickersData.data[collectionName];

  if (!collection) {
    res.status(404).json({ error: "Collection not found" });
    return;
  }

  res.json(collection);
});
app.get("/sticker-search", (req, res) => {
  const query = req.query.query as string;

  if (!query) {
    res.status(400).json({ error: "Missing name parameter" });
    return;
  }

  const matchingItems: Sticker[] = [];
  for (let collection in stickersData.data) {
    matchingItems.push(
      ...stickersData.data[collection].filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }

  if (matchingItems.length === 0) {
    res.status(404).json({ error: "No stickers found" });
    return;
  }

  res.json(matchingItems);
});
app.get("/sticker-collection-search", (req, res) => {
  const query = req.query.query as string;
  const collection_name = req.query.collection_name as string;

  if (!query || !collection_name) {
    res
      .status(400)
      .json({ error: "Missing query or collection_name parameter" });
    return;
  }

  const collection = stickersData.data[collection_name];
  if (!collection) {
    res.json({ error: "Collection not found" });
    return;
  }
  const matchingItems: Sticker[] = [];
  matchingItems.push(
    ...stickersData.data[collection_name].filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    )
  );
  if (matchingItems.length === 0) {
    res.status(404).json({ error: "No stickers found" });
    return;
  }

  res.json(matchingItems);
});
app.get("/weapon-types", (req, res) => {
  const weaponTypes = Object.keys(weaponsData.data);
  res.json(weaponTypes);
});
app.get("/weapons", (req, res) => {
  const weapon_type = req.query.weapon_type as string;
  if (!weapon_type) {
    res.status(400).json({ error: "Missing weapon_type query parameter" });
    return;
  }
  const weapons = Object.keys(weaponsData.data[weapon_type]);
  res.json(weapons);
});
app.get("/weapon-skins", (req, res) => {
  const weapon_type = req.query.weapon_type as string;
  const weapon_name = req.query.weapon_name as string;
  if (!weapon_type || !weapon_name) {
    res
      .status(400)
      .json({ error: "Missing weapon_type or weapon_name query parameter" });
    return;
  }
  const weapons = weaponsData.data[weapon_type];
  if (!weapons) {
    res.status(404).json({ error: "No weapons with that type" });
    return;
  }
  const weaponSkins = weapons[weapon_name].data;
  if (!weaponSkins) {
    res.status(404).json({ error: "No weapons with that name" });
  }
  res.json(weaponSkins);
});
app.get("/skin-search", (req, res) => {
  const query = req.query.query as string;
  const weapon_name = req.query.weapon_name as string;
  const weapon_type = req.query.weapon_type as string;
  // const weapon_types = Object.keys(weaponsData.data);
  if (!query || !weapon_name || !weapon_type) {
    res
      .status(400)
      .json({
        error: "Missing query,weapon_name or weapon_type query parameter/s",
      });
    return;
  }
  const weaponsType = weaponsData.data[weapon_type];
  if (!weaponsType) {
    res.status(404).json({ error: "Wrong weapon type" });
    return;
  }
  const skins = weaponsType[weapon_name];
  if (!skins) {
    res.status(404).json({ error: "Wrong weapon name" });
    return;
  }

  let matchingItems: WeaponSkin[] = [];

  for (let skin of skins.data) {
    if (skin.name.toLowerCase().includes(query)) {
      matchingItems.push(skin);
    }
  }
  if (matchingItems.length === 0) {
    res.status(404).json({ error: "No matching weapons" });
    return;
  }
  res.json(matchingItems);
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
