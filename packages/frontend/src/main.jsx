import ReactDOM from "react-dom/client";
import "./main.css";
import Grid from "./Grid.jsx";
import Presets from "./Presets.jsx";
import Items from "./Items.jsx";

export default function MyApp() {
  return (
    <div className="app">
      <Presets />
      <Grid />
      <Items />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MyApp />);
