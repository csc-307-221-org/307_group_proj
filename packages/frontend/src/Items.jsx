import React, { useState } from "react";
import Popout from "./Popout";

function Items() {
  const [showWhiteBox, setShowWhiteBox] = useState(false);

  return (
    <div className="items-wrap">
      <div className="items-top">
        <span>Items</span>

        <button
          type="button"
          title="Press Me"
          className="item-red"
          onClick={() => setShowWhiteBox(true)}>add items
        </button>

        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box">
          Where Item is<br />to drag
        </div>

        <div className="items-line"></div>

        <div className="delete-box">
          Drag Item to<br />Delete here
        </div>
      </div>

      {showWhiteBox && (
        <Popout onClose={() => setShowWhiteBox(false)} />
      )}
    </div>
  );
}

export default Items;