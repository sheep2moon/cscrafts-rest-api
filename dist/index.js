"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Load JSON data from file
const loadData = (filename) => {
    const jsonData = fs_1.default.readFileSync(path_1.default.resolve(__dirname, filename), "utf-8");
    return JSON.parse(jsonData);
};
const data = loadData("./stickers_data.json");
app.get("/collection", (req, res) => {
    const collectionName = req.query.collection_name;
    if (!collectionName) {
        res.status(400).json({ error: "Missing collection_name parameter" });
        return;
    }
    const collection = data.data[collectionName];
    if (!collection) {
        res.status(404).json({ error: "Collection not found" });
        return;
    }
    res.json(collection);
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
