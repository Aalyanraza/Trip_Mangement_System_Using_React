import { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";

function ProfileSettings() {
  const { user, setUser } = useContext(UserContext);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8000/user/${user.id}/update`, {
        name,
        password: password || null,
      });

      setMessage("Profile updated successfully");
      setUser({ ...user, name: res.data.user.name }); // update context
      setPassword(""); // clear password field
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
      {message && <p className="text-green-600 mb-4">{message}</p>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Email (cannot change)</label>
          <input
            value={user.email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">New Password</label>
          <input
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;
