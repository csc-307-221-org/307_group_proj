import { useState } from "react";
function Grid() {
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(4);
    const total = rows * cols;
    const items = Array.from({ length: total });
  return (
    <div className="grid">
        <h2>change rows</h2>
         <input
        type="range"
        min="1"
        max="10"
        value={rows}
        onChange={(e) => setRows(Number(e.target.value))}
    />
    <h2>change columns</h2>
    <input
        type="range"
        min="1"
        max="10"
        value={cols}
        onChange={(e) => setCols(Number(e.target.value))}
    />
      <div className="container">
        <div className="grid-box"
          style={{
            gridTemplateColumns: `repeat(${cols}, 100px)`,
            gridTemplateRows: `repeat(${rows}, 100px)`,
          }}
        >
          {items.map((_, i) => (
            <div className="grid-item" key={i}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Grid;