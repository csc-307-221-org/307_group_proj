import { useEffect, useState } from "react";
import Popout from "./Popout";
import SpawnedItem from "./SpawnedItem";

function Items({ token }) {
  const [showWhiteBox, setShowWhiteBox] = useState(false);
  const [accountItems, setAccountItems] = useState([]);
  const [renderedItems, setRenderedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");

  const API_URL = "http://localhost:8000";

  function getItemId(item) {
    const id = item?.id || item?._id;
    return id ? String(id) : "";
  }

  function makeRenderedId(item) {
    const itemId = getItemId(item);

    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${itemId}-${Date.now()}-${Math.random()}`;
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

  function itemFromBackendToFrontend(item) {
    return {
      ...item,
      id: getItemId(item),
      cells: item.cells || shapeToCells(item.shape),
    };
  }

  function itemToRenderedItem(item) {
    return {
      ...item,
      renderedId: makeRenderedId(item),
    };
  }

  const selectedItem =
    accountItems.find((item) => getItemId(item) === selectedItemId) || null;

  async function handleSaveItem(newItem) {
    if (!token) {
      alert("Please log in before adding items.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend rejected item:", data);
        alert(data.error || "Error adding item");
        return;
      }

      const createdItem = itemFromBackendToFrontend(data.item || data);

      setAccountItems((currentItems) => [...currentItems, createdItem]);
      setRenderedItems((currentItems) => [
        ...currentItems,
        itemToRenderedItem(createdItem),
      ]);

      setSelectedItemId(getItemId(createdItem));
      setShowWhiteBox(false);
    } catch (err) {
      console.error("Could not connect to backend:", err);
      alert("Could not connect to backend.");
    }
  }

  function handleSelectItem(event) {
    const itemId = event.target.value;
    setSelectedItemId(itemId);

    const itemToRender = accountItems.find(
      (item) => getItemId(item) === itemId,
    );

    if (!itemToRender) {
      return;
    }

    setRenderedItems((currentItems) => [
      ...currentItems,
      itemToRenderedItem(itemToRender),
    ]);
  }

  function handleRemoveItemFromPage(itemToRemove) {
    if (!itemToRemove) {
      return;
    }

    setRenderedItems((currentItems) =>
      currentItems.filter(
        (item) => item.renderedId !== itemToRemove.renderedId,
      ),
    );
  }

  async function handleDeleteItemFromDatabase(itemToDelete = selectedItem) {
    if (!token) {
      alert("Please log in before deleting items.");
      return;
    }

    if (!itemToDelete) {
      alert("Please select an item to delete.");
      return;
    }

    const itemId = getItemId(itemToDelete);

    if (!itemId) {
      alert("This item does not have a database id.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        console.error("Could not delete item:", data);
        alert(data.error || "Error deleting item.");
        return;
      }

      setAccountItems((currentItems) =>
        currentItems.filter((item) => getItemId(item) !== itemId),
      );

      setRenderedItems((currentItems) =>
        currentItems.filter((item) => getItemId(item) !== itemId),
      );

      setSelectedItemId((currentId) => (currentId === itemId ? "" : currentId));
    } catch (err) {
      console.error("Could not delete item from backend:", err);
      alert("Could not connect to backend.");
    }
  }

  useEffect(() => {
    async function loadItems() {
      if (!token) {
        setAccountItems([]);
        setRenderedItems([]);
        setSelectedItemId("");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/items`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Could not load items.", data);
          return;
        }

        const backendItems = Array.isArray(data)
          ? data
          : data.items_list || data.items || [];

        const frontendItems = backendItems.map(itemFromBackendToFrontend);

        setAccountItems(frontendItems);
        setRenderedItems(frontendItems.map(itemToRenderedItem));

        setSelectedItemId(
          frontendItems.length > 0 ? getItemId(frontendItems[0]) : "",
        );
      } catch (err) {
        console.error("Could not load items.", err);
      }
    }

    loadItems();
  }, [token]);

  return (
    <div className="items-wrap">
      <div className="items-top">
        <span>Items</span>

        <div className="item-red">
          <button
            title="Press Me"
            className="item-red"
            onClick={() => setShowWhiteBox(true)}
          >
            Add Items
          </button>
        </div>

        <select
          className="item-select"
          value={selectedItemId}
          onChange={handleSelectItem}
          disabled={!token || accountItems.length === 0}
        >
          <option value="">
            {token ? "Select an item" : "Log in to view items"}
          </option>

          {accountItems.map((item) => (
            <option key={getItemId(item)} value={getItemId(item)}>
              {item.name || "Unnamed Item"}
            </option>
          ))}
        </select>

        <button
          className="delete-item-button"
          onClick={() => handleDeleteItemFromDatabase()}
          disabled={!selectedItem}
        >
          Delete
        </button>

        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box">
          <div className="drop-box-label">
            Where Item is
            <br />
            to drag
          </div>

          {renderedItems.map((item) => (
            <SpawnedItem
              key={item.renderedId}
              item={item}
              onDelete={handleRemoveItemFromPage}
            />
          ))}
        </div>

        <div className="items-line"></div>

        <div className="delete-box">
          Drag Item to
          <br />
          Delete here
        </div>
      </div>

      {showWhiteBox && (
        <Popout
          onClose={() => setShowWhiteBox(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

export default Items;
