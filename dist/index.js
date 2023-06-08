"use strict";
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
    const weapons = Object.keys(weaponsData.data[weapon_type]);
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
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
