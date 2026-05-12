import itemModel from "../models/item.js";

function getItems(ownerId) {
  let promise;

  if (ownerId === undefined) {
    promise = itemModel.find();
  } else {
    promise = findItemsByOwnerId(ownerId);
  }

  return promise;
}

function findItemById(id) {
  return itemModel.findById(id);
}

function addItem(item) {
  const itemToAdd = new itemModel(item);
  const promise = itemToAdd.save();

  return promise;
}

function findItemsByOwnerId(ownerId) {
  return itemModel.find({ ownerId: ownerId });
}

function deleteItemById(id) {
  return itemModel.findByIdAndDelete(id);
}

function updateItemById(id, item) {
  return itemModel.findByIdAndUpdate(id, item, {
    new: true,
    runValidators: true,
  });
}

export default {
  getItems,
  findItemById,
  addItem,
  findItemsByOwnerId,
  deleteItemById,
  updateItemById,
};
