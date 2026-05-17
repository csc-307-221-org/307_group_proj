import React from "react";

function Items() {
  return (
    <div className="items-wrap">
      <div className="items-top">
        <span>Items</span>
        <div className="item-red"></div>
        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box">
          Where Item is
          <br />
          to drag
        </div>

        <div className="items-line"></div>

        <div className="delete-box">
          Drag Item to
          <br />
          Delete here
        </div>
      </div>
    </div>
  );
}

export default Items;
