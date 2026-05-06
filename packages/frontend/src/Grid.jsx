import { useState } from "react";

function Grid() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  const total = rows * cols;
  const items = Array.from({ length: total });

  return (
    <div className="grid">
      <h2 style={{ paddingLeft: "150px" }}>x by x box</h2>

      <div style={{ display: "flex", paddingLeft: "150px" }}>
        <input
          style={{ width: "50px", padding: "4px", fontSize: "14px" }}
          min="1"
          max="10"
          type="number"
          value={rows}
          onChange={(e) => {
            let val = e.target.value;
            if (val === "") return setRows(""); // allow typing

            val = Number(val);
            if (val > 10) val = 10;
            if (val < 1) val = 1;

            setRows(val);
          }}
        />

        <h2>X</h2>

        <input
          min="1"
          max="10"
          style={{ width: "50px", padding: "4px", fontSize: "14px" }}
          type="number"
          value={cols}
          onChange={(e) => {
            let val = e.target.value;
            if (val === "") return setCols("");

            val = Number(val);
            if (val > 10) val = 10;
            if (val < 1) val = 1;

            setCols(val);
          }}
        />
      </div>

      <div className="container">
        <div
          className="grid-box"
          style={{
            display: "grid",
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
