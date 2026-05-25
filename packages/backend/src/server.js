// backend.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { registerUser, loginUser, authenticateUser } from "./auth.js";
import itemServices from "./services/item-services.js";
import backpackServices from "./services/backpack-services.js";

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

app.post("/signup", registerUser);

app.post("/login", loginUser);

app.get("/protected", authenticateUser, (req, res) => {
  res.send("You have access to protected data.");
});

// gets all items from the database
app.get("/items", authenticateUser, (req, res) => {
  itemServices
    .getItems(req.user.userId)
    .then((result) => res.send({ items_list: result }))
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// gets one item from the database
app.get("/items/:id", authenticateUser, (req, res) => {
  itemServices
    .findItemById(req.params.id, req.user.userId)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.send(result);
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// adds a new item to the database
app.post("/items", authenticateUser, (req, res) => {
  // create a new item using the request data
  // attach the logged in user id
  const item = {
    ...req.body,
    ownerId: req.user.userId,
  };

  itemServices
    .addItem(item)
    .then((result) => res.status(201).send(result))
    .catch((err) =>
      res.status(400).json({
        error: err.message,
      }),
    );
});

// deletes one item from the database
app.delete("/items/:id", authenticateUser, (req, res) => {
  itemServices
    .deleteItemById(req.params.id, req.user.userId)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.status(204).send();
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// updates one item in the database
app.put("/items/:id", authenticateUser, (req, res) => {
  itemServices
    .updateItemById(req.params.id, req.user.userId, req.body)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.send(result);
      }
    })
    .catch((err) =>
      res.status(400).json({
        error: err.message,
      }),
    );
});

// gets all backpacks from the database
app.get("/backpack", authenticateUser, (req, res) => {
  backpackServices
    .getBackpacks(req.user.userId)
    .then((result) => res.send({ backpacks_list: result }))
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// gets one backpack from the database
app.get("/backpack/:id", authenticateUser, (req, res) => {
  backpackServices
    .findBackpackById(req.params.id, req.user.userId)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.send(result);
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// adds a new backpack to the database
app.post("/backpack", authenticateUser, (req, res) => {
  // create a new backpack using the request data
  // attach the logged in user id
  const backpack = {
    ...req.body,
    ownerId: req.user.userId,
  };

  backpackServices
    .addBackpack(backpack)
    .then((result) => res.status(201).send(result))
    .catch((err) =>
      res.status(400).json({
        error: err.message,
      }),
    );
});

// deletes one backpack from the database
app.delete("/backpack/:id", authenticateUser, (req, res) => {
  backpackServices
    .deleteBackpackById(req.params.id, req.user.userId)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.status(204).send();
      }
    })
    .catch((err) =>
      res.status(500).json({
        error: err.message,
      }),
    );
});

// updates one backpack in the database
app.put("/backpack/:id", authenticateUser, (req, res) => {
  backpackServices
    .updateBackpackById(req.params.id, req.user.userId, req.body)
    .then((result) => {
      if (result === null) {
        res.status(404).send("Resource not found.");
      } else {
        res.send(result);
      }
    })
    .catch((err) =>
      res.status(400).json({
        error: err.message,
      }),
    );
});

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
