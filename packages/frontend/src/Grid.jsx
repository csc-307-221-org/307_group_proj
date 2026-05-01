import { useState } from "react";
function Grid() {
    const [rows, setRows] = useState(4);
    const [cols, setCols] = useState(4);
    const total = rows * cols;
    const items = Array.from({ length: total });
  return (
  <body>
    <div className="grid">
        <h2 style={{paddingLeft: '150px',color: 'white'}}>x by x box</h2>
        <div style={{ display: 'flex',paddingLeft: '150px' }}>
         <input
            style={{ width: '50px', padding: '4px', fontSize: '14px' }}
            type="index"
            min="1"
            max="10"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            />
            <h2 style={{color: 'white'}}>X</h2>
            <input
                style={{ width: '50px', padding: '4px', fontSize: '14px' }}
                type="index"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
            />
            </div>
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
  </body>
  );
}

export default Grid;