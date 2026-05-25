const Presets = () => {
  const boxes = Array.from({ length: 20 });

  return (
    <div className="presets">
      <div className="presets-buttons">
        <button>Save</button>
        <button>Preset</button>
      </div>

      <div className="presets-title">Presets</div>

      <div className="presets-list">
        {boxes.map((_, i) => (
          <div className="preset-box" key={i}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Presets;
