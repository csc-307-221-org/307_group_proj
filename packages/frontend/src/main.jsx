import { useEffect, useState } from "react";
import ReactDOMClient from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import "./main.css";

import Grid from "./Grid.jsx";
import Presets from "./Presets.jsx";
import Login from "./Login.jsx";
import Items from "./Items.jsx";

function GifPage() {
  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
      <h1>LEON KENNEDY YES!!!!!!!!!!!!!!!!!!</h1>

      <img
        src="https://media1.tenor.com/m/MmSvfoqiQEYAAAAd/bbg-leon-leon-kennedy.gif"
        alt="gif"
        width="300"
      />
    </div>
  );
}
const API_URL =
  "https://backback-organization-221-g4bhdubhhsg3bhd4.westus3-01.azurewebsites.net";

function HomePage({ token }) {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  const [placedItems, setPlacedItems] = useState(() =>
    Array.from({ length: 4 }, () => Array(4).fill(null)),
  );

  const [presets, setPresets] = useState([]);

  const [presetRenderState, setPresetRenderState] = useState({
    version: 0,
    items: [],
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlacedItems((current) =>
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => current[row]?.[col] || null),
      ),
    );
  }, [rows, cols]);

  const navigate = useNavigate();

  useEffect(() => {
    let typed = "";

    function handleKeyDown(event) {
      typed += event.key.toLowerCase();

      if (typed.length > 20) {
        typed = typed.slice(-20);
      }

      if (typed.includes("leon")) {
        navigate("/gif/gif");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);
  useEffect(() => {
    async function loadPresetsFromDatabase() {
      if (!token) {
        setPresets([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/backpack`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Could not load presets.", data);
          return;
        }

        const backendPresets = Array.isArray(data)
          ? data
          : data.backpacks_list || data.backpacks || [];

        setPresets(backendPresets);
      } catch (err) {
        console.error("Could not load presets.", err);
      }
    }

    loadPresetsFromDatabase();
  }, [token]);

  function getItemInstanceKey(item) {
    if (!item) {
      return "";
    }

    if (item.renderedId !== undefined && item.renderedId !== null) {
      return `rendered:${item.renderedId}`;
    }

    const databaseId = item.id || item._id;

    if (databaseId !== undefined && databaseId !== null) {
      return `database:${databaseId}`;
    }

    return "";
  }

  function sameItem(a, b) {
    if (!a || !b) {
      return false;
    }

    const aKey = getItemInstanceKey(a);
    const bKey = getItemInstanceKey(b);

    if (aKey && bKey) {
      return aKey === bKey;
    }

    return a === b;
  }

  function getTotalBackpackWeight(grid) {
    const countedItems = new Set();

    return grid.reduce((total, row) => {
      return (
        total +
        row.reduce((rowTotal, spot) => {
          if (!spot?.fullItem) {
            return rowTotal;
          }

          const itemKey = getItemInstanceKey(spot.fullItem);

          if (!itemKey || countedItems.has(itemKey)) {
            return rowTotal;
          }

          countedItems.add(itemKey);

          return rowTotal + (Number(spot.fullItem.weight) || 0);
        }, 0)
      );
    }, 0);
  }

  function shapeToCells(shape) {
    if (!Array.isArray(shape)) {
      return [];
    }

    return shape.flatMap((rowArray, row) =>
      rowArray
        .map((value, col) => (value === 1 ? { row, col } : null))
        .filter(Boolean),
    );
  }

  function cellsToShape(cells) {
    if (!Array.isArray(cells) || cells.length === 0) {
      return [[1]];
    }

    const minRow = Math.min(...cells.map((cell) => cell.row));
    const maxRow = Math.max(...cells.map((cell) => cell.row));
    const minCol = Math.min(...cells.map((cell) => cell.col));
    const maxCol = Math.max(...cells.map((cell) => cell.col));

    const shape = Array.from({ length: maxRow - minRow + 1 }, () =>
      Array(maxCol - minCol + 1).fill(0),
    );

    cells.forEach((cell) => {
      shape[cell.row - minRow][cell.col - minCol] = 1;
    });

    return shape;
  }

  function rotateShapeMatrix(shape, rotation) {
    if (rotation === 0) {
      return shape;
    }

    if (rotation === 90) {
      return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
    }

    if (rotation === 180) {
      return shape.map((row) => [...row].reverse()).reverse();
    }

    if (rotation === 270) {
      return shape[0].map((_, col) =>
        shape.map((row) => row[row.length - 1 - col]),
      );
    }

    return shape;
  }

  function makeObjectId() {
    const bytes = new Uint8Array(12);

    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return Array.from(bytes)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }

    const timeHex = Date.now().toString(16).padStart(12, "0").slice(-12);
    const randomHex = Math.floor(Math.random() * 0xffffffffffff)
      .toString(16)
      .padStart(12, "0")
      .slice(-12);

    return `${timeHex}${randomHex}`;
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

  function placedItemsToBackpackPayload(name) {
    const itemsByKey = new Map();

    placedItems.forEach((rowArray, row) => {
      rowArray.forEach((spot, col) => {
        if (!spot?.fullItem) {
          return;
        }

        const itemKey = getItemInstanceKey(spot.fullItem);

        if (!itemKey || itemsByKey.has(itemKey)) {
          return;
        }

        const fullItem = spot.fullItem;
        const cells = fullItem.cells || shapeToCells(fullItem.shape);
        const shape = Array.isArray(fullItem.shape)
          ? fullItem.shape
          : cellsToShape(cells);

        itemsByKey.set(itemKey, {
          backpackItemId: makeObjectId(),
          topRow: row - spot.itemPiece.row,
          topCol: col - spot.itemPiece.col,
          item: {
            name: fullItem.name || spot.name || "Unnamed Item",
            description: fullItem.description || spot.description || "",
            imageData: fullItem.imageData || "",
            tags: Array.isArray(fullItem.tags) ? fullItem.tags : [],
            shape,
            weight: Number(fullItem.weight) || 0,
          },
        });
      });
    });

    const items = Array.from(itemsByKey.values()).map((entry) => ({
      _id: entry.backpackItemId,
      ...entry.item,
    }));

    const placements = Array.from(itemsByKey.values()).map((entry) => ({
      backpackItemId: entry.backpackItemId,
      row: entry.topRow,
      col: entry.topCol,
      rotation: 0,
    }));

    const weightsum = items.reduce((total, item) => total + item.weight, 0);

    return {
      name,
      description: "",
      rows: Number(rows) || 1,
      cols: Number(cols) || 1,
      items,
      placements,
      weightsum,
    };
  }

  function backpackToPresetState(backpack) {
    const nextRows = Number(backpack.rows) || 1;
    const nextCols = Number(backpack.cols) || 1;
    const nextGrid = Array.from({ length: nextRows }, () =>
      Array(nextCols).fill(null),
    );

    const nextRenderedItems = [];

    const itemsById = new Map(
      (backpack.items || []).map((item) => [String(item._id), item]),
    );

    (backpack.placements || []).forEach((placement) => {
      const item = itemsById.get(String(placement.backpackItemId));

      if (!item) {
        return;
      }

      const renderedId = String(placement.backpackItemId);
      const rotatedShape = rotateShapeMatrix(
        item.shape || [[1]],
        placement.rotation ?? 0,
      );
      const cells = shapeToCells(rotatedShape);
      const fullItem = {
        ...item,
        id: String(item._id),
        renderedId,
        cells,
        imageData: item.imageData || "",
        hasBeenDragged: true,
      };
      const { itemSize } = getShapeInfo(fullItem);

      nextRenderedItems.push(fullItem);

      cells.forEach((cell) => {
        const gridRow = placement.row + cell.row;
        const gridCol = placement.col + cell.col;

        if (!nextGrid[gridRow] || gridCol < 0 || gridCol >= nextCols) {
          return;
        }

        nextGrid[gridRow][gridCol] = {
          name: item.name,
          description: item.description,
          itemSize,
          itemPiece: {
            row: cell.row,
            col: cell.col,
          },
          fullItem,
        };
      });
    });

    return {
      grid: nextGrid,
      renderedItems: nextRenderedItems,
    };
  }

  async function saveCurrentPreset() {
    if (!token) {
      alert("Please log in before saving presets.");
      return;
    }

    const presetName = `Preset ${presets.length + 1}`;
    const backpackPayload = placedItemsToBackpackPayload(presetName);

    try {
      const response = await fetch(`${API_URL}/backpack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backpackPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend rejected preset:", data);
        alert(data.error || "Error saving preset.");
        return;
      }

      const createdPreset = data.backpack || data;

      setPresets((currentPresets) => [...currentPresets, createdPreset]);
    } catch (err) {
      console.error("Could not save preset:", err);
      alert("Could not connect to backend.");
    }
  }

  async function deleteCurrentPreset(index) {
    const preset = presets.at(index);
    const presetId = preset?._id || preset?.id;

    if (!presetId) {
      setPresets((currentPresets) =>
        currentPresets.filter((_, presetIndex) => presetIndex !== index),
      );
      return;
    }

    if (!token) {
      alert("Please log in before deleting presets.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/backpack/${presetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.error("Could not delete preset:", data);
        alert(data.error || "Error deleting preset.");
        return;
      }

      setPresets((currentPresets) =>
        currentPresets.filter((_, presetIndex) => presetIndex !== index),
      );
    } catch (err) {
      console.error("Could not delete preset:", err);
      alert("Could not connect to backend.");
    }
  }

  function loadPreset(preset) {
    setRows(preset.rows);
    setCols(preset.cols);

    if (preset.grid) {
      setPlacedItems(copyPlacedItems(preset.grid));
      return;
    }

    const nextPresetState = backpackToPresetState(preset);

    setPlacedItems(nextPresetState.grid);
    setPresetRenderState((currentState) => ({
      version: currentState.version + 1,
      items: nextPresetState.renderedItems,
    }));
  }

  const totalBackpackWeight = getTotalBackpackWeight(placedItems);

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
        totalBackpackWeight={totalBackpackWeight}
      />

      <Items
        token={token}
        onPlaceItem={handlePlaceItem}
        onCanPlaceItem={canPlaceItem}
        onRemoveItemFromMatrix={handleRemoveItemFromMatrix}
        placedItems={placedItems}
        presetRenderState={presetRenderState}
      />
    </div>
  );
}

function AuthPage({ authFunction, buttonLabel }) {
  const navigate = useNavigate();

  function handleAuth(credentials) {
    authFunction(credentials).then(() => {
      navigate("/");
    });
  }

  return <Login handleSubmit={handleAuth} buttonLabel={buttonLabel} />;
}

export default function MyApp() {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  function saveToken(newToken) {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }

  function logoutUser() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  function loginUser(creds) {
    return fetch(`${API_URL}/login`, {
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
    return fetch(`${API_URL}/signup`, {
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

  return (
    <BrowserRouter>
      <nav className="auth-nav">
        <Link to="/login" className="auth-button">
          Login
        </Link>

        {token && (
          <button className="logout-button" onClick={logoutUser}>
            Logout
          </button>
        )}
      </nav>

      <p style={{ color: "white" }}>{message}</p>

      <Routes>
        <Route path="/" element={<HomePage token={token} />} />

        <Route path="/login" element={<AuthPage authFunction={loginUser} />} />

        <Route
          path="/signup"
          element={<AuthPage authFunction={signupUser} buttonLabel="Sign Up" />}
        />
        <Route path="/gif/:word" element={<GifPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(<MyApp />);
