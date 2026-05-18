// backend.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import itemServices from "./services/item-services.js";

// this reads the .env file so we can use the database link
dotenv.config();

const app = express();
const port = 8000;
const TEMP_OWNER_ID = "676767676767676767676767";

// lets us read JSON data from requests
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
    // get all items that belong to our temp user
    const items = await itemServices.getItems(TEMP_OWNER_ID);
    // send items back
    res.json(items);
  } catch (err) {
    res.send("Error getting items");
  }
});

// adds a new item to the database
app.post("/items", async (req, res) => {
  try {
    // create a new item using the request data
    // attach the temp owner id
    const item = await itemServices.addItem({
      ...req.body,
      ownerId: TEMP_OWNER_ID,
    });

    // send back the item we just created
    res.json(item);
  } catch (err) {
    // something broke while adding item
    res.send("Error adding item");
  }
});

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
