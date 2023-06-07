import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import path from "path";
import { StickersData } from "./global-types";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Load JSON data from file
const loadData = (filename: string): any => {
  const jsonData = fs.readFileSync(path.resolve(__dirname, filename), "utf-8");
  return JSON.parse(jsonData);
};

const data: { data: StickersData } = loadData("./stickers_data.json");

app.get("/collection", (req, res) => {
  const collectionName = req.query.collection_name as string;

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
