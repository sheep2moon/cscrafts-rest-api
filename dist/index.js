"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsdom_1 = __importDefault(require("jsdom"));
// import fetch from "node-fetch";
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Load JSON data from file
const loadData = (filename) => {
    const jsonData = fs_1.default.readFileSync(path_1.default.resolve(__dirname, filename), "utf-8");
    return JSON.parse(jsonData);
};
exports.loadData = loadData;
const stickersData = (0, exports.loadData)("./stickers_data.json");
const weaponsData = (0, exports.loadData)("./weapons_data.json");
app.get("/sticker-collections", (req, res) => {
    const collectionNames = Object.keys(stickersData.data);
    res.json(collectionNames);
});
// collection_name
app.get("/sticker-collection", (req, res) => {
    const collectionName = req.query.collection_name;
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
// query collection_name?
app.get("/sticker-search", (req, res) => {
    const query = req.query.query;
    const collection_name = req.query.collection_name;
    if (!query) {
        res.status(400).json({ error: "Missing name parameter" });
        return;
    }
    const matchingItems = [];
    if (!collection_name) {
        for (let collection in stickersData.data) {
            matchingItems.push(...stickersData.data[collection].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())));
        }
    }
    else {
        matchingItems.push(...stickersData.data[collection_name].filter((item) => item.name.toLowerCase().includes(query.toLowerCase())));
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
    const weapon_type = req.query.weapon_type;
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
    const weapon_type = req.query.weapon_type;
    const weapon_name = req.query.weapon_name;
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
    const query = req.query.query;
    const weapon_name = req.query.weapon_name;
    const weapon_type = req.query.weapon_type;
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
    let matchingItems = [];
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
app.get("/craft-search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const craft = req.body;
    const stickerQuery = craft.stickers.join(",");
    if (!craft.stickers) {
        res.status(400).json({ error: "Missing stickers value" });
        return;
    }
    if (!craft.exteriors) {
        res.status(400).json({ error: "Missing exteriors value" });
        return;
    }
    if (!craft.weapon) {
        res.status(400).json({ error: "Missing weapon value" });
        return;
    }
    const exteriorQueries = craft.exteriors.map((wearCategory) => `&category_730_Exterior%5B%5D=tag_WearCategory${wearCategory}`);
    const exteriorQuery = exteriorQueries.join("");
    const searchQuery = "http://steamcommunity.com/market/search?q=%22" +
        encodeURIComponent(stickerQuery) +
        "%22&descriptions=1&category_730_ItemSet%5B%5D=any" +
        exteriorQuery +
        "&category_730_Weapon%5B%5D=tag_weapon_" +
        craft.weapon.toLowerCase() +
        "&category_730_Quality%5B%5D=" +
        craft.exterior_tag +
        "#p1_price_asc";
    const steamRes = yield fetch(searchQuery);
    const html = yield steamRes.text();
    const dom = new jsdom_1.default.JSDOM(html);
    const resultDivs = dom.window.document.querySelectorAll(".market_listing_searchresult");
    if (resultDivs.length === 0) {
        res.status(404).json({ error: "Skins not found" });
        return;
    }
    const matching = [];
    resultDivs.forEach((resultDiv) => {
        var _a, _b, _c;
        const result = {
            name: ((_a = resultDiv.querySelector(".market_listing_item_name")) === null || _a === void 0 ? void 0 : _a.textContent) || "",
            price: ((_b = resultDiv.querySelector(".market_table_value .normal_price")) === null || _b === void 0 ? void 0 : _b.textContent) || "",
            img_src: ((_c = resultDiv.querySelector("img")) === null || _c === void 0 ? void 0 : _c.getAttribute("src")) || "",
        };
        matching.push(result);
    });
    console.log(matching);
    if (matching.length > 0) {
        res.status(200).json(matching);
    }
    else {
        res.status(400).json({ error: "No matching crafts" });
    }
}));
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
