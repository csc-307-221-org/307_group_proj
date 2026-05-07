import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import Grid from "./Grid.jsx";
import Presets from "./presets.jsx";
import Items from "./items.jsx";

function MyApp() {
  return (
    <div className="app">
      <Presets />
      <Grid />
      <Items />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MyApp />);
