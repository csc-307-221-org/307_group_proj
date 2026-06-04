import { useEffect, useState } from "react";
import Popout from "./Popout";
import SpawnedItem from "./SpawnedItem";

function Items({
  token,
  onPlaceItem,
  onRemoveItemFromMatrix,
  onCanPlaceItem,
  placedItems,
  presetRenderState,
}) {
  const [showWhiteBox, setShowWhiteBox] = useState(false);
  const [accountItems, setAccountItems] = useState([]);
  const [renderedItems, setRenderedItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemBeingEdited, setItemBeingEdited] = useState(null);

  const API_URL =
    "https://backback-organization-221-g4bhdubhhsg3bhd4.westus3-01.azurewebsites.net";

  function getItemId(item) {
    const id = item?.id || item?._id;
    return id ? String(id) : "";
  }

  function makeRenderedId(item) {
    const itemId = getItemId(item);

    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
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
      hasBeenDragged: false,
    };
  }

  const selectedItem =
    accountItems.find((item) => getItemId(item) === selectedItemId) || null;

  useEffect(() => {
    if (!presetRenderState) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRenderedItems((currentItems) => {
      const unplacedItems = currentItems.filter((item) => !item.hasBeenDragged);

      return [...presetRenderState.items, ...unplacedItems];
    });
  }, [presetRenderState]);

  function replaceItemInDragBox(itemToRender) {
    if (!itemToRender) {
      return;
    }

    setRenderedItems((currentItems) => [
      ...currentItems.filter((item) => item.hasBeenDragged),
      itemToRenderedItem(itemToRender),
    ]);
  }

  function handleSpawnItemOnPage(itemToSpawn) {
    if (!itemToSpawn) {
      return;
    }

    setRenderedItems((currentItems) => [
      ...currentItems.map((item) =>
        item.renderedId === itemToSpawn.renderedId
          ? { ...item, hasBeenDragged: true }
          : item,
      ),
      itemToRenderedItem(itemToSpawn),
    ]);
  }

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
      setSelectedItemId(getItemId(createdItem));

      setRenderedItems((currentItems) => [
        ...currentItems.filter((item) => item.hasBeenDragged),
        itemToRenderedItem(createdItem),
      ]);

      setShowWhiteBox(false);
    } catch (err) {
      console.error("Could not connect to backend:", err);
      alert("Could not connect to backend.");
    }
  }

  async function handleUpdateItem(updatedItem) {
    if (!token) {
      alert("Please log in before editing items.");
      return;
    }

    if (!itemBeingEdited) {
      alert("Please select an item to edit.");
      return;
    }

    const itemId = getItemId(itemBeingEdited);

    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedItem),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Could not update item:", data);
        alert(data.error || "Error updating item.");
        return;
      }

      const editedItem = itemFromBackendToFrontend(data.item || data);

      const placedCopiesOfEditedItem = renderedItems.filter(
        (item) => getItemId(item) === itemId && item.hasBeenDragged,
      );

      placedCopiesOfEditedItem.forEach((item) => {
        onRemoveItemFromMatrix(item);
      });

      setAccountItems((currentItems) =>
        currentItems.map((item) =>
          getItemId(item) === itemId ? editedItem : item,
        ),
      );

      setRenderedItems((currentItems) => [
        ...currentItems.filter(
          (item) => getItemId(item) !== itemId && item.hasBeenDragged,
        ),
        itemToRenderedItem(editedItem),
      ]);

      setSelectedItemId(getItemId(editedItem));
      setItemBeingEdited(null);
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

    replaceItemInDragBox(itemToRender);
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

      const remainingAccountItems = accountItems.filter(
        (item) => getItemId(item) !== itemId,
      );

      const nextSelectedItem = remainingAccountItems[0] || null;
      const nextSelectedItemId = nextSelectedItem
        ? getItemId(nextSelectedItem)
        : "";

      setAccountItems(remainingAccountItems);
      setSelectedItemId(nextSelectedItemId);

      setRenderedItems((currentItems) => {
        const remainingDraggedItems = currentItems.filter(
          (item) => getItemId(item) !== itemId && item.hasBeenDragged,
        );

        if (!nextSelectedItem) {
          return remainingDraggedItems;
        }

        return [...remainingDraggedItems, itemToRenderedItem(nextSelectedItem)];
      });
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
        const firstItem = frontendItems[0] || null;

        setAccountItems(frontendItems);
        setSelectedItemId(firstItem ? getItemId(firstItem) : "");
        setRenderedItems(firstItem ? [itemToRenderedItem(firstItem)] : []);
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

        <div className="item-button-row">
          <div className="item-red">
            <button
              title="Press Me"
              className="item-red"
              onClick={() => {
                setItemBeingEdited(null);
                setShowWhiteBox(true);
              }}
            >
              Add Items
            </button>
          </div>

          <button
            type="button"
            className="edit-item-button"
            onClick={() => {
              if (!selectedItem) {
                alert("Please select an item to edit.");
                return;
              }

              setItemBeingEdited(selectedItem);
              setShowWhiteBox(true);
            }}
            disabled={!selectedItem}
          >
            Edit
          </button>

          <button
            className="delete-item-button"
            onClick={() => handleDeleteItemFromDatabase()}
            disabled={!selectedItem}
          >
            Delete
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

        <div className="item-black"></div>
      </div>

      <div className="items-panel">
        <div className="drop-box" aria-label="Items available to drag">
          {renderedItems.map((item) => (
            <SpawnedItem
              key={item.renderedId}
              item={item}
              onDelete={handleRemoveItemFromPage}
              onFirstDrag={handleSpawnItemOnPage}
              onPlaceItem={onPlaceItem}
              onRemoveItemFromMatrix={onRemoveItemFromMatrix}
              onCanPlaceItem={onCanPlaceItem}
              placedItems={placedItems}
            />
          ))}
        </div>

        <div
          className="delete-box"
          aria-label="Drag item here to remove it from the page"
          title="Drag item here to remove it from the page"
        >
          <svg className="trash-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M6 6l1 16h10l1-16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </div>
      </div>

      {showWhiteBox && (
        <Popout
          onClose={() => {
            setShowWhiteBox(false);
            setItemBeingEdited(null);
          }}
          onSave={itemBeingEdited ? handleUpdateItem : handleSaveItem}
          itemToEdit={itemBeingEdited}
        />
      )}
    </div>
  );
}

export default Items;
