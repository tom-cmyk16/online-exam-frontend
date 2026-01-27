import React, { useState, useEffect } from "react";
import axios from "axios";

interface Department {
  _id: string;
  name: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const getAxiosConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const ManageDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Department[]>(
        `${API_BASE}/departments`,
        getAxiosConfig()
      );
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
      const res = await axios.post(
        `${API_BASE}/departments`,
        { name: newDeptName.trim() },
        getAxiosConfig()
      );
      setDepartments([...departments, res.data]);
      setNewDeptName("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create department");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const res = await axios.put(
        `${API_BASE}/departments/${id}`,
        { name: editName.trim() },
        getAxiosConfig()
      );
      setDepartments(departments.map((d) => (d._id === id ? res.data : d)));
      setEditingId(null);
      setEditName("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update department");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      await axios.delete(`${API_BASE}/departments/${id}`, getAxiosConfig());
      setDepartments(departments.filter((d) => d._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-6">
        Manage Departments
      </h2>

      {/* Create Form */}
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          placeholder="Enter department name"
          className="flex-1 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Department
        </button>
      </form>

      {/* Departments List */}
      <div className="space-y-2">
        {departments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No departments found. Create one above.
          </p>
        ) : (
          departments.map((dept) => (
            <div
              key={dept._id}
              className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
            >
              {editingId === dept._id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(dept._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditName("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-lg font-medium">{dept.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(dept._id);
                        setEditName(dept.name);
                      }}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">
          📌 Department Information
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Each department operates independently</li>
          <li>• Department Heads can only manage their own department</li>
          <li>• Students and courses are department-specific</li>
          <li>• Total Departments: {departments.length}</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageDepartments;
