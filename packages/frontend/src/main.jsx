import { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./main.css";

import Grid from "./Grid.jsx";
import Presets from "./Presets.jsx";
import Login from "./Login.jsx";
import Items from "./Items.jsx";

function HomePage({ token }) {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  const [placedItems, setPlacedItems] = useState(() =>
    Array.from({ length: 4 }, () => Array(4).fill(null)),
  );

  const [presets, setPresets] = useState([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlacedItems((current) =>
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => current[row]?.[col] || null),
      ),
    );
  }, [rows, cols]);

  function sameItem(a, b) {
    if (!a || !b) return false;

    if (
      a.id !== undefined &&
      a.id !== null &&
      b.id !== undefined &&
      b.id !== null
    ) {
      return a.id === b.id;
    }

    return a === b;
  }

  function getShapeInfo(item) {
    const cells = item.cells || [];

    const minRow = cells.length
      ? Math.min(...cells.map((cell) => cell.row))
      : 0;

    const maxRow = cells.length
      ? Math.max(...cells.map((cell) => cell.row))
      : 0;

    const minCol = cells.length
      ? Math.min(...cells.map((cell) => cell.col))
      : 0;

    const maxCol = cells.length
      ? Math.max(...cells.map((cell) => cell.col))
      : 0;

    return {
      cells,
      minRow,
      minCol,
      itemSize: `${maxRow - minRow + 1}x${maxCol - minCol + 1}`,
    };
  }

  function copyPlacedItems(grid) {
    return grid.map((row) =>
      row.map((cell) => {
        if (!cell) return null;

        return {
          ...cell,
          itemPiece: { ...cell.itemPiece },
        };
      }),
    );
  }

  function canPlaceItem(item, startRow, startCol) {
    const { cells, minRow, minCol } = getShapeInfo(item);

    return cells.every((cell) => {
      const gridRow = startRow + (cell.row - minRow);
      const gridCol = startCol + (cell.col - minCol);

      const spot = placedItems[gridRow]?.[gridCol];

      if (spot === undefined) return false;
      if (spot === null) return true;

      return sameItem(spot.fullItem, item);
    });
  }

  function handlePlaceItem(item, startRow, startCol) {
    setPlacedItems((currentGrid) => {
      return placeItemInGrid(currentGrid, item, startRow, startCol);
    });
  }

  function placeItemInGrid(current, item, startRow, startCol) {
    let updated = copyPlacedItems(current);

    const { cells, minRow, minCol, itemSize } = getShapeInfo(item);

    const blocked = cells.some((cell) => {
      const gridRow = startRow + (cell.row - minRow);
      const gridCol = startCol + (cell.col - minCol);

      const spot = current[gridRow]?.[gridCol];

      if (spot === undefined) return true;
      if (spot === null) return false;

      return !sameItem(spot.fullItem, item);
    });

    if (blocked) {
      alert("There is already an item there.");
      return current;
    }

    updated = updated.map((row) =>
      row.map((spot) => {
        if (spot && sameItem(spot.fullItem, item)) {
          return null;
        }

        return spot;
      }),
    );

    cells.forEach((cell) => {
      const gridRow = startRow + (cell.row - minRow);
      const gridCol = startCol + (cell.col - minCol);

      updated[gridRow][gridCol] = {
        name: item.name,
        description: item.description,
        itemSize,
        itemPiece: {
          row: cell.row - minRow,
          col: cell.col - minCol,
        },
        fullItem: item,
      };
    });

    return updated;
  }

  function handleRemoveItemFromMatrix(item) {
    setPlacedItems((current) =>
      current.map((row) =>
        row.map((spot) => {
          if (spot && sameItem(spot.fullItem, item)) {
            return null;
          }

          return spot;
        }),
      ),
    );
  }

  function saveCurrentPreset() {
    const presetCopy = copyPlacedItems(placedItems);

    setPresets((currentPresets) => [
      ...currentPresets,
      {
        name: `Preset ${currentPresets.length + 1}`,
        rows: rows,
        cols: cols,
        grid: presetCopy,
      },
    ]);
  }

  function deleteCurrentPreset(index) {
    console.log("preset:", presets.at(index));
    console.log("index:", index);
    setPresets((presets) => {
      return presets.filter((_, i) => i !== index);
    });
  }

  function loadPreset(preset) {
    setRows(preset.rows);
    setCols(preset.cols);
    setPlacedItems(copyPlacedItems(preset.grid));
    // copyPlacedItems(preset.grid).forEach();
  }

  return (
    <div className="app">
      <Presets
        presets={presets}
        onSavePreset={saveCurrentPreset}
        onDeletePreset={deleteCurrentPreset}
        onLoadPreset={loadPreset}
      />

      <Grid
        rows={rows}
        cols={cols}
        setRows={setRows}
        setCols={setCols}
        placedItems={placedItems}
      />

      <Items
        token={token}
        onPlaceItem={handlePlaceItem}
        onCanPlaceItem={canPlaceItem}
        onRemoveItemFromMatrix={handleRemoveItemFromMatrix}
      />
    </div>
  );
}

export default function MyApp() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  const [message, setMessage] = useState("");

  function saveToken(newToken) {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }

  function loginUser(creds) {
    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creds),
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((payload) => {
            saveToken(payload.token);
            setMessage("Login successful; auth token saved");
          });
        } else {
          setMessage("Login failed");
        }
      })
      .catch((error) => {
        setMessage(`Login error: ${error}`);
      });
  }

  function signupUser(creds) {
    fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creds),
    })
      .then((response) => {
        if (response.status === 201) {
          response.json().then((payload) => {
            saveToken(payload.token);
            setMessage(`Signup successful for user: ${creds.username}`);
          });
        } else {
          setMessage("Signup failed");
        }
      })
      .catch((error) => {
        setMessage(`Signup error: ${error}`);
      });
  }

  function testProtectedRoute() {
    fetch("https://backback-organization-221-g4bhdubhhsg3bhd4.westus3-01.azurewebsites.net/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.text())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        setMessage(`Error: ${error}`);
      });
  }

  return (
    <BrowserRouter>
      <p style={{ color: "white" }}>{message}</p>

      <button onClick={testProtectedRoute}>Test Protected Route</button>

      <Routes>
        <Route path="/" element={<HomePage token={token} />} />

        <Route path="/login" element={<Login handleSubmit={loginUser} />} />

        <Route
          path="/signup"
          element={<Login handleSubmit={signupUser} buttonLabel="Sign Up" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(<MyApp />);
