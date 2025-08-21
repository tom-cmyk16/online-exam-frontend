import React, { useState, useEffect } from "react";

// User interface
interface User {
  _id: string; // Auto-generated client-side ID
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
}

const ManageUsersPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // For editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserData, setEditingUserData] = useState<Partial<User>>({});

  // Fetch users from backend (optional if needed)
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/manageuser");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.warn("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Generate a unique ID for new users
  const generateUserId = () => {
    return "user_" + Date.now() + Math.floor(Math.random() * 1000);
  };

  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new user
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department.trim()) {
      alert("Please enter a department.");
      return;
    }

    const newUser: User = {
      _id: generateUserId(),
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      role: formData.role,
      department: formData.department,
    };

    setUsers([newUser, ...users]); // Add to frontend list
    alert("User added successfully!");

    // Clear form
    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "student",
      department: "",
    });
  };

  // Delete user
  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUsers(users.filter((u) => u._id !== id));
  };

  // Start editing
  const startEditUser = (user: User) => {
    setEditingUserId(user._id);
    setEditingUserData({ ...user });
  };

  // Cancel editing
  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditingUserData({});
  };

  // Handle edit input change
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditingUserData({ ...editingUserData, [e.target.name]: e.target.value });
  };

  // Save edited user
  const saveEditUser = () => {
    if (!editingUserId) return;
    setUsers(
      users.map((u) =>
        u._id === editingUserId ? { ...u, ...editingUserData } : u
      )
    );
    alert("User updated successfully!");
    cancelEditUser();
  };

  // Filtered and paginated users
  const filteredUsers = users.filter(
    (u) =>
      (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "all" || u.role === roleFilter)
  );
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Manage Users</h2>

      {/* Add User Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4 mb-6">
        {["fullName", "username", "email", "password", "department"].map(
          (field) => (
            <input
              key={field}
              type={field === "password" ? "password" : "text"}
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              className="border border-gray-300 p-2 rounded-lg"
              required
            />
          )
        )}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border border-gray-300 p-2 rounded-lg"
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded col-span-3 hover:bg-green-700"
        >
          Add User
        </button>
      </form>

      {/* Search & Filter */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or username"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-1/3"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-green-100">
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((u) => (
              <tr key={u._id} className="border-t border-gray-200">
                {editingUserId === u._id ? (
                  <>
                    <td className="px-4 py-2">{u._id}</td>
                    <td className="px-4 py-2">
                      <input
                        name="fullName"
                        value={editingUserData.fullName || ""}
                        onChange={handleEditChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="username"
                        value={editingUserData.username || ""}
                        onChange={handleEditChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="email"
                        value={editingUserData.email || ""}
                        onChange={handleEditChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        name="role"
                        value={editingUserData.role || ""}
                        onChange={handleEditChange}
                        className="border rounded p-1 w-full"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="department"
                        value={editingUserData.department || ""}
                        onChange={handleEditChange}
                        className="border rounded p-1 w-full"
                      />
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={saveEditUser}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditUser}
                        className="text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{u._id}</td>
                    <td className="px-4 py-2">{u.fullName}</td>
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2 capitalize">{u.role}</td>
                    <td className="px-4 py-2">{u.department}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => startEditUser(u)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ManageUsersPage;
