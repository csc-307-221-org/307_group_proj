import backpackModel from "../models/backpack.js";

function getBackpacks(ownerId) {
  return backpackModel.find({ ownerId: ownerId });
}

function findBackpackById(id, ownerId) {
  return backpackModel.findOne({ _id: id, ownerId: ownerId });
}

function addBackpack(backpack) {
  const backpackToAdd = new backpackModel(backpack);
  const promise = backpackToAdd.save();

  return promise;
}

function deleteBackpackById(id, ownerId) {
  return backpackModel.findOneAndDelete({ _id: id, ownerId: ownerId });
}

function updateBackpackById(id, ownerId, backpack) {
  const updatedBackpack = {
    name: backpack.name,
    description: backpack.description,
    rows: backpack.rows,
    cols: backpack.cols,
    items: backpack.items,
    placements: backpack.placements,
    weightsum: backpack.weightsum,
  };

  return backpackModel.findOneAndUpdate(
    { _id: id, ownerId: ownerId },
    updatedBackpack,
    {
      new: true,
      runValidators: true,
    },
  );
}

export default {
  getBackpacks,
  findBackpackById,
  addBackpack,
  deleteBackpackById,
  updateBackpackById,
};
