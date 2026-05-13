import itemModel from "../models/item.js";

function getItems(ownerId) {
  return itemModel.find({ ownerId: ownerId });
}

function findItemById(id, ownerId) {
  return itemModel.findOne({ _id: id, ownerId: ownerId });
}

function addItem(item) {
  const itemToAdd = new itemModel(item);
  const promise = itemToAdd.save();

  return promise;
}

function deleteItemById(id, ownerId) {
  return itemModel.findOneAndDelete({ _id: id, ownerId: ownerId });
}

function updateItemById(id, ownerId, item) {
  return itemModel.findOneAndUpdate({ _id: id, ownerId: ownerId }, item, {
    new: true,
    runValidators: true,
  });
}

export default {
  getItems,
  findItemById,
  addItem,
  deleteItemById,
  updateItemById,
};
