import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import {
  Craft,
  CraftSearchResult,
  Sticker,
  StickersData,
  WeaponSkin,
  WeaponsData,
} from "./global-types";
import jsdom from "jsdom";
// import fetch from "node-fetch";

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
// collection_name
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

// app.get("/sticker",(req,res) => {
//   const stickerName = req.query.sticker_name as string;
//   if (!stickerName){
//     res.status(400).json({error: "Missing sticker name query parameter"})
//   }

// })

// query collection_name?
app.get("/sticker-search", (req, res) => {
  const query = req.query.query as string;
  const collection_name = req.query.collection_name as string;

  if (!query) {
    res.status(400).json({ error: "Missing name parameter" });
    return;
  }
  const matchingItems: Sticker[] = [];

  if (!collection_name) {
    for (let collection in stickersData.data) {
      matchingItems.push(
        ...stickersData.data[collection].filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  } else {
    matchingItems.push(
      ...stickersData.data[collection_name].filter((item) =>
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

app.get("/weapon-types", (req, res) => {
  const weaponTypes = Object.keys(weaponsData.data);
  res.json(weaponTypes);
});
// weapon_type
app.get("/weapons", (req, res) => {
  const weapon_type = req.query.weapon_type as string;
  if (!weapon_type) {
    res.status(400).json({ error: "Missing weapon_type query parameter" });
    return;
  }
  const weapons = Object.keys(weaponsData.data[weapon_type]).map((key) => ({
    name: key,
    img_src: weaponsData.data[weapon_type][key].img_src,
  }));
  if (!weapons) {
    res.status(404).json({ error: "No matching weapons" });
    return;
  }
  res.json(weapons);
});
// weapon_type weapon_name
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
// query weapon_type weapon_name
app.get("/weapon-skin-search", (req, res) => {
  const query = req.query.query as string;
  const weapon_name = req.query.weapon_name as string;
  const weapon_type = req.query.weapon_type as string;
  // const weapon_types = Object.keys(weaponsData.data);
  if (!query || !weapon_name || !weapon_type) {
    res.status(400).json({
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

app.post("/craft-search", async (req, res) => {
  const craft: Craft = req.body;
  const stickerQuery = craft.stickers.join(",");

  if (!craft.stickers) {
    res.status(400).json({ error: "Missing stickers value" });
    return;
  }
  if (!craft.exteriors) {
    res.status(400).json({ error: "Missing exteriors value" });
    return;
  }
  if (!craft.weapon_tag) {
    res.status(400).json({
      error:
        "Missing weapon value, if you want any you should pass string 'any' ",
    });
    return;
  }

  const exteriorQueries = craft.exteriors.map(
    (wearCategory) =>
      `&category_730_Exterior%5B%5D=tag_WearCategory${wearCategory}`
  );
  const exteriorQuery = exteriorQueries.join("");

  const searchQuery =
    "http://steamcommunity.com/market/search?q=%22" +
    encodeURIComponent(stickerQuery) +
    "%22&descriptions=1&category_730_ItemSet%5B%5D=any" +
    exteriorQuery +
    "&category_730_Weapon%5B%5D=" +
    craft.weapon_tag +
    "&category_730_Quality%5B%5D=" +
    craft.type_tag +
    "#p1_price_asc";

  const steamRes = await fetch(searchQuery);
  const html = await steamRes.text();
  const dom = new jsdom.JSDOM(html);

  const resultLinks = dom.window.document.querySelectorAll(
    ".market_listing_row_link"
  );

  if (resultLinks.length === 0) {
    res.status(404).json({ error: "Skins not found" });
    return;
  }

  const matching: Array<CraftSearchResult> = [];

  resultLinks.forEach((resultLink) => {
    const result: CraftSearchResult = {
      name:
        resultLink.querySelector(".market_listing_item_name")?.textContent ||
        "",
      price:
        resultLink.querySelector(".market_table_value .normal_price")
          ?.textContent || "",
      img_src: resultLink.querySelector("img")?.getAttribute("src") || "",
      market_url: resultLink.getAttribute("href") || "",
    };
    matching.push(result);
  });

  if (matching.length > 0) {
    res.status(200).json(matching);
  } else {
    res.status(400).json({ error: "No matching crafts" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
