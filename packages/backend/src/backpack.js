import mongoose from "mongoose";

function validateShapeMatrix(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Item shape must be a non empty matrix.");
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
}

const BackpackItemSchema = new mongoose.Schema(
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

    tags: {
      type: [String],
      default: [],
    },

    shape: {
      type: [[Number]],
      required: true,
      validate: validateShapeMatrix,
    },
    weight: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
);

const PlacementSchema = new mongoose.Schema(
  {
    // This references one of the embedded items inside this backpack.
    // It should match one of the _id values inside Backpack.items.
    backpackItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    row: {
      type: Number,
      required: true,
      min: 0,
      max: 9,
    },

    col: {
      type: Number,
      required: true,
      min: 0,
      max: 9,
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
    // Optional for now because authentication is not implemented yet.
    // Later once users/auth are added, will change required to true.
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    cols: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    // These are the actual item snapshots saved inside the backpack.
    items: {
      type: [BackpackItemSchema],
      default: [],
    },

    // These describe where each embedded item is placed.
    placements: {
      type: [PlacementSchema],
      default: [],
    },
  },
  {
    collection: "backpacks",
    timestamps: true,
  },
);

const Backpack = mongoose.model("Backpack", BackpackSchema);

export default Backpack;
