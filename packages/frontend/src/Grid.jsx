import { useEffect } from "react";
import useWindowScale from "./Windowscale";

function Grid({ rows, cols, setRows, setCols, placedItems }) {
  const safeRows = Number(rows) || 1;
  const safeCols = Number(cols) || 1;

  const { maxSize } = useWindowScale(0.65);

  const cellSize = Math.min(100, maxSize / Math.max(safeRows, safeCols));

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--matrix-cell-size",
      `${cellSize}px`,
    );
  }, [cellSize]);

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
          {items.map((_, i) => {
            const row = Math.floor(i / safeCols);
            const col = i % safeCols;

            const placedItem = placedItems[row]?.[col];

            return (
              <div
                className="grid-item"
                key={i}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              >
                {placedItem ? (
                  <div className="grid-item-info">
                    <div>{placedItem.name}</div>

                    <div>
                      Piece: [{placedItem.itemPiece.row},{" "}
                      {placedItem.itemPiece.col}]
                    </div>

                    <div>
                      Size: {placedItem.itemSize.length}x
                      {placedItem.itemSize[0]?.length}
                    </div>

                    <div>{placedItem.description}</div>
                  </div>
                ) : (
                  i + 1
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Grid;
