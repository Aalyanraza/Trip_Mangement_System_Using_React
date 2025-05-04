import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function TripChat({ user }) {
  const { tripId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  // Fetch saved chat history on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/trips/${tripId}/chat`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };

    fetchMessages();
  }, [tripId]);

  // Set up WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/trips/${tripId}?user_id=${user.id}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => {
      ws.current.close();
    };
  }, [tripId, user.id]);

  const sendMessage = () => {
    if (input.trim()) {
      ws.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Trip Chat</h2>
      <div className="border h-64 overflow-y-auto p-2 mb-4 bg-gray-100 rounded">
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            <strong>{msg.user_id === user.id ? "You" : `User ${msg.user_id}`}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded px-2 py-1 flex-grow"
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 py-1 rounded">
          Send
        </button>
      </div>
    </div>
  );
}

export default TripChat;
