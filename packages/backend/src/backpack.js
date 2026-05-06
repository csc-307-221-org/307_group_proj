import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    shape: {
      type: [[Number]],
      required: true,
      validate(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("Item shape must be a non-empty matrix.");
        }

        const columnLength = value[0].length;

        if (columnLength === 0) {
          throw new Error("Item shape rows must not be empty.");
        }

        for (const row of value) {
          if (!Array.isArray(row) || row.length !== columnLength) {
            throw new Error("Item shape must be a rectangular matrix.");
          }

          for (const cell of row) {
            if (cell !== 0 && cell !== 1) {
              throw new Error("Item shape cells must be either 0 or 1.");
            }
          }
        }
      },
    },
  },
  { _id: true },
);

const PlacementSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    row: {
      type: Number,
      required: true,
      min: 0,
    },

    col: {
      type: Number,
      required: true,
      min: 0,
    },

    rotation: {
      type: Number,
      required: true,
      default: 0,
      enum: [0, 90, 180, 270],
    },
  },
  { _id: true },
);

const BackpackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
    },

    cols: {
      type: Number,
      required: true,
      min: 1,
    },

    items: {
      type: [ItemSchema],
      default: [],
    },

    placements: {
      type: [PlacementSchema],
      default: [],
    },
  },
  { collection: "backpacks" },
);

const Backpack = mongoose.model("Backpack", BackpackSchema);

export default Backpack;
