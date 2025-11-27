import React, { useState, useEffect } from "react";
import axios from "axios";
import UserForm from "./UserForm";

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: "student" | "instructor" | "admin" | "departmentHead" | "examCommittee";
  department: string;
  year?: string;
  programType?: string;
  section?: string;
  isActive: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token") || "";
const axiosConfig = { headers: { Authorization: `Bearer ${getToken()}` } };

const ManageStudentsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");

  // Current department of the logged-in user
  const currentUserDepartment = localStorage.getItem("department") || "";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get<User[]>(
        `${API_BASE}/manageuser`,
        axiosConfig
      );
      // Only students of the same department
      setUsers(
        res.data.filter(
          (u) => u.role === "student" && u.department === currentUserDepartment
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (userData: Partial<User>) => {
    userData.role = "student";
    userData.department = currentUserDepartment;
    const res = await axios.post(
      `${API_BASE}/manageuser`,
      userData,
      axiosConfig
    );
    setUsers((prev) => [res.data, ...prev]);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUserId) return;
    userData.department = currentUserDepartment;
    const res = await axios.put(
      `${API_BASE}/manageuser/${editingUserId}`,
      userData,
      axiosConfig
    );
    setUsers((prev) =>
      prev.map((u) => (u._id === editingUserId ? res.data : u))
    );
    setEditingUserId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await axios.patch(`${API_BASE}/manageuser/${id}/status`, {}, axiosConfig);
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
    );
  };

  // Filtered users by search + year
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(search) ||
      u.username.toLowerCase().includes(search) ||
      (u.section || "").toLowerCase().includes(search);

    const matchesYear = yearFilter === "all" || u.year === yearFilter;

    return matchesSearch && matchesYear;
  });

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error} <button onClick={fetchUsers}>Retry</button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        Manage Students
      </h2>
      <p className="text-green-800 mb-4">
        Department:{" "}
        <span className="font-semibold">{currentUserDepartment}</span>
      </p>

      <UserForm
        onSubmit={editingUserId ? handleUpdateUser : handleAddUser}
        initialData={
          editingUserId ? users.find((u) => u._id === editingUserId) : undefined
        }
        isEditing={!!editingUserId}
        onCancel={() => setEditingUserId(null)}
      />

      {/* Search and Year Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 mb-2">
        <input
          type="text"
          placeholder="Search by name/username/section"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
        </select>
      </div>

      <div className="overflow-x-auto border rounded mt-4">
        <table className="min-w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3">Full Name</th>
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Year</th>
              <th className="p-3">Program</th>
              <th className="p-3">Section</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} className="border-b hover:bg-green-50">
                <td className="p-3">{u.fullName}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.department}</td>
                <td className="p-3">{u.year || "-"}</td>
                <td className="p-3">{u.programType || "-"}</td>
                <td className="p-3">{u.section || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setEditingUserId(u._id)}
                    className="text-blue-600 underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                    className="text-sm"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-green-600">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageStudentsPage;
