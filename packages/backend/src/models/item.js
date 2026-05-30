import mongoose from "mongoose";
import validateShapeMatrix from "../utils/validateShapeMatrix.js";

const ItemSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

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

    imageData: {
      type: String,
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
  {
    collection: "items",
    timestamps: true,
  },
);

const Item = mongoose.model("Item", ItemSchema);

export default Item;
