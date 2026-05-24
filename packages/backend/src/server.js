// backend.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import itemServices from "./services/item-services.js";

// this reads the .env file so we can use the database link
dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const TEMP_OWNER_ID = "676767676767676767676767";

// lets us read JSON data from requests
app.use(cors());
app.use(express.json());

// connect to our MongoDB database using the link in .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB :)")) // it worked :D
  .catch((err) =>
    console.error("Damnit all... MongoDB connection error:", err),
  ); // something broke >:(

// test route so we know the server is working
app.get("/", (req, res) => {
  res.send("67 is our sacred number.");
});

// gets all items from the database
app.get("/items", async (req, res) => {
  try {
    const items = await itemServices.getItems(TEMP_OWNER_ID);
    res.json(items);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// adds a new item to the database
app.post("/items", async (req, res) => {
  try {
    const item = await itemServices.addItem({
      ...req.body,
      ownerId: TEMP_OWNER_ID,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
});

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
