import React, { useState } from "react";
import Popout from "./Popout";
import SpawnedItem from "./SpawnedItem";

function Items() {
  const [showWhiteBox, setShowWhiteBox] = useState(false);
  const [savedItems, setSavedItems] = useState([]);

  function handleSaveItem(newItem) {
    setSavedItems([...savedItems, newItem]);
    setShowWhiteBox(false);
  }

  return (
    <div className="items-wrap">
      <div className="items-top">
        <span>Items</span>

        <button
          type="button"
          title="Press Me"
          className="item-red"
          onClick={() => setShowWhiteBox(true)}
        >
          add items
        </button>

        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box">
          <div className="drop-box-label">
            Where Item is
            <br />
            to drag
          </div>

          {savedItems.map((item, index) => (
            <SpawnedItem key={index} item={item} />
          ))}
        </div>

        <div className="items-line"></div>

        <div className="delete-box">
          Drag Item to
          <br />
          Delete here
        </div>
      </div>

      {showWhiteBox && (
        <Popout
          onClose={() => setShowWhiteBox(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

export default Items;

