import { useState } from "react";
import useWindowScale from "./WindowScale";

function Grid() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  const safeRows = Number(rows) || 1;
  const safeCols = Number(cols) || 1;

  const { maxSize } = useWindowScale(0.65);

  const cellSize = Math.min(100, maxSize / Math.max(safeRows, safeCols));

  const items = Array.from({ length: safeRows * safeCols });

  const handleChange = (e, setter) => {
    let val = e.target.value;

    if (val === "") return setter("");

    val = Number(val);
    if (val > 10) val = 10;
    if (val < 1) val = 1;

    setter(val);
  };

  return (
    <div className="wrapper">
      <div className="top-bar">
        <div className="top-left">
          <div>Box Size</div>

          <div className="controls">
            <input
              min="1"
              max="10"
              type="number"
              value={rows}
              onChange={(e) => handleChange(e, setRows)}
            />

            <span>X</span>

            <input
              min="1"
              max="10"
              type="number"
              value={cols}
              onChange={(e) => handleChange(e, setCols)}
            />
          </div>
        </div>

        <div className="top-right">
          <div>Item Search</div>
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="container">
        <div
          className="grid-box"
          style={{
            gridTemplateColumns: `repeat(${safeCols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${safeRows}, ${cellSize}px)`,
          }}
        >
          {items.map((_, i) => (
            <div
              className="grid-item"
              key={i}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Grid;