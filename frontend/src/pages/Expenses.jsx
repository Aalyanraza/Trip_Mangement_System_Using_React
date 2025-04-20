import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

function Expenses() {
  const { tripId } = useParams();

  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [notes, setNotes] = useState("");

  const fetchExpenses = async () => {
    const res = await API.get(`/trips/${tripId}/expenses`);
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await API.post(`/trips/${tripId}/expenses`, {
      title,
      amount: parseFloat(amount),
      category,
      notes,
    });
    setTitle("");
    setAmount("");
    setCategory("Food");
    setNotes("");
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await API.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Trip Expenses</h1>
      <h2 className="text-center text-lg font-medium text-gray-700">
        Total: ₹{total.toFixed(2)}
      </h2>

      <form onSubmit={handleAdd} className="space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        >
          <option>Food</option>
          <option>Transport</option>
          <option>Hotel</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Add Expense
        </button>
      </form>

      <ul className="space-y-2">
        {expenses.map((exp) => (
          <li
            key={exp.id}
            className="border px-4 py-2 rounded flex justify-between items-start bg-white shadow"
          >
            <div>
              <h3 className="font-semibold">{exp.title}</h3>
              <p className="text-sm text-gray-600">
                ₹{exp.amount.toFixed(2)} — {exp.category}
              </p>
              {exp.notes && (
                <p className="text-xs text-gray-500 mt-1">{exp.notes}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(exp.id)}
              className="text-red-500 text-sm hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
