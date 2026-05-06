import React from "react";

const Presets = () => {
  const boxes = Array.from({ length: 20 });

  return (
    <div className="presets">
      <div className="presets-title">Presets</div>

      <div className="presets-list">
        {boxes.map((_, i) => (
          <div key={i} className="preset-box">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};


export default Presets;