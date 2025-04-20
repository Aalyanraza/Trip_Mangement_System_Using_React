import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function Itinerary() {
  const { tripId } = useParams();
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchItinerary();
  }, []);

  const fetchItinerary = async () => {
    const res = await API.get(`/trips/${tripId}/itinerary`);
    setItems(res.data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await API.post(`/trips/${tripId}/itinerary`, {
      name,
      time,
      notes,
      order: items.length,
    });
    setName("");
    setTime("");
    setNotes("");
    fetchItinerary();
  };

  const handleDelete = async (id) => {
    await API.delete(`/itinerary/${id}`);
    fetchItinerary();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);

    // Update local state
    setItems(newItems);

    // Update order in backend
    await Promise.all(
      newItems.map((item, index) =>
        API.put(`/itinerary/${item.id}`, {
          ...item,
          order: index,
        })
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Trip Itinerary</h1>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Add Item
        </button>
      </form>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="itinerary">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white border rounded p-4 shadow flex justify-between items-start"
                    >
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.time}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-600 mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Itinerary;
