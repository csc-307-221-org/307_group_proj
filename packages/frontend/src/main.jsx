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
        placedItems={placedItems}
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
    return fetch(
      "https://backback-organization-221-g4bhdubhhsg3bhd4.westus3-01.azurewebsites.net/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      },
    )
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
    fetch(
      "https://backback-organization-221-g4bhdubhhsg3bhd4.westus3-01.azurewebsites.net/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(creds),
      },
    )
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
