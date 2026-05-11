// backend.js

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

// this reads the .env file so we can use the database link
dotenv.config();

const app = express();
const port = 8000;

// lets us read JSON data from requests
app.use(express.json());

// connect to our MongoDB database using the link in .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB :)")) // worked
  .catch((err) =>
    console.error("Damnit all... MongoDB connection error:", err),
  ); // something broke

// test route so we know the server is working
app.get("/", (req, res) => {
  res.send("67 is our sacred number.");
});

// start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/backpack", (req, res) => {
  // Grab list of just backpack ID/Name for the presets list
});

app.get("/backpack/:id", (req, res) => {
  // Grab the full backpack data to render on website
});

app.post("/backpack", (req, res) => {
  // Create a new backpack
});

app.delete("/backpack/:id", (req, res) => {
  // Delete a backpack
});

app.put("/backpack/:id", (req, res) => {
  // Update a backpack
});
