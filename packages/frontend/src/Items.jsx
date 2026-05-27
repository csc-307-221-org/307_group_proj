import { useEffect, useState } from "react";
import Popout from "./Popout";
import SpawnedItem from "./SpawnedItem";

function Items({ token, onPlaceItem, onRemoveItemFromMatrix, onCanPlaceItem }) {
  const [showWhiteBox, setShowWhiteBox] = useState(false);
  const [savedItems, setSavedItems] = useState([]);

  const API_URL = "http://localhost:8000";

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
      cells: item.cells || shapeToCells(item.shape),
    };
  }

  async function handleSaveItem(newItem) {
    console.log("Sending item to backend:", newItem);

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

      console.log("Item saved by backend:", data);

      setSavedItems((currentItems) => [
        ...currentItems,
        itemFromBackendToFrontend(data),
      ]);

      setShowWhiteBox(false);
    } catch (err) {
      console.error("Could not connect to backend:", err);
      alert("Could not connect to backend.");
    }
  }

  async function handleDeleteItem(itemToDelete) {
    setSavedItems((currentItems) =>
      currentItems.filter((item) => item !== itemToDelete),
    );

    if (itemToDelete.id) {
      try {
        await fetch(`${API_URL}/items/${itemToDelete.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.error("Could not delete item from backend:", err);
      }
    }
  }

  useEffect(() => {
    async function loadItems() {
      if (!token) {
        setSavedItems([]);
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

        setSavedItems(data.items_list.map(itemFromBackendToFrontend));
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

        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box">
          <div className="drop-box-label">
            Where Item is
            <br />
            to drag
          </div>

          {savedItems.map((item, index) => (
            <SpawnedItem
              key={item.id || item._id || `${item.name}-${index}`}
              item={item}
              onDelete={handleDeleteItem}
              onPlaceItem={onPlaceItem}
              onRemoveItemFromMatrix={onRemoveItemFromMatrix}
              onCanPlaceItem={onCanPlaceItem}
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
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
}

export default Items;
