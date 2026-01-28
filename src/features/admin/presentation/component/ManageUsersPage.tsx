import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../../../api/xiosInstance";

type Role =
  | "student"
  | "instructor"
  | "admin"
  | "departmentHead"
  | "examCommittee";

interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: Role;
  department: string;
  year?: string;
  programType?: string;
  section?: string;
  isActive: boolean;
}

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  },
});

// Get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ---------------- UserForm ----------------
const UserForm: React.FC<{
  onSubmit: (u: Partial<User> & { password?: string }) => Promise<void>;
  initialData?: Partial<User>;
  isEditing?: boolean;
  onCancel?: () => void;
}> = ({ onSubmit, initialData, isEditing = false, onCancel }) => {
  const currentUser = getCurrentUser();
  const isDepartmentHead = currentUser?.role === "departmentHead";
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student" as Role,
    department: isDepartmentHead ? currentUser.department : "",
    year: "",
    programType: "regular",
    section: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        password: "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormError(null); // Clear error when user makes changes
    setFormSuccess(null); // Clear success when user makes changes
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      // Prepare data for submission - remove empty optional fields
      const submitData: any = { ...formData };
      if (isEditing && submitData.password === "") {
        delete submitData.password; // Don't send password if editing and not changed
      }

      await onSubmit(submitData);
      
      // Show success message
      setFormSuccess(isEditing ? "User updated successfully!" : "User created successfully!");
      
      // Reset form after successful submission if not editing
      if (!isEditing) {
        setFormData({
          fullName: "",
          username: "",
          email: "",
          password: "",
          role: "student",
          department: "",
          year: "",
          programType: "regular",
          section: "",
          isActive: true,
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error("Form submission error:", err);
      if (err.response?.status === 500) {
        setFormError(
          "Internal server error. Please try again later or contact support."
        );
      } else {
        setFormError(err.response?.data?.message || "Failed to save user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const showStudentFields = formData.role === "student";

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
    >
      {formError && (
        <div className="md:col-span-3 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {formError}
        </div>
      )}
      
      {formSuccess && (
        <div className="md:col-span-3 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ {formSuccess}
        </div>
      )}

      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="p-2 border rounded"
      />
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
        className="p-2 border rounded"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        type="email"
        required
        className="p-2 border rounded"
      />
      {!isEditing && (
        <input
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
          minLength={6}
          className="p-2 border rounded"
        />
      )}

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="p-2 border rounded"
        required
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="departmentHead">Department Head</option>
        <option value="examCommittee">Exam Committee</option>
      </select>

      {formData.role !== "admin" && (
        <input
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="Department"
          required
          readOnly={isDepartmentHead}
          disabled={isDepartmentHead}
          className={`p-2 border rounded ${isDepartmentHead ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          title={isDepartmentHead ? `Fixed to your department: ${currentUser.department}` : ''}
        />
      )}

      {showStudentFields && (
        <>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Year</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
            <option value="5">Year 5</option>
          </select>
          <select
            name="programType"
            value={formData.programType}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="regular">Regular</option>
            <option value="extension">Extension</option>
            <option value="summer">Summer</option>
          </select>
          <input
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="Section"
            className="p-2 border rounded"
          />
        </>
      )}

      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
        <input
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleCheckbox}
        />
        <label>Active User</label>
      </div>

      <div className="md:col-span-3 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white py-2 px-4 rounded disabled:bg-green-400"
        >
          {submitting ? "..." : isEditing ? "Update User" : "Add User"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ---------------- ManageUsersPage ----------------
const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const usersPerPage = 6;

  // Apply URL parameters as filters when component loads
  useEffect(() => {
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');
    
    if (roleParam && ['student', 'instructor', 'admin', 'departmentHead', 'examCommittee'].includes(roleParam)) {
      setRoleFilter(roleParam);
    }
    
    if (statusParam && ['active', 'inactive'].includes(statusParam)) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<User[]>("/manageuser", getAuthConfig());
      setUsers(res.data);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (userData: any) => {
    try {
      console.log("📤 Sending user data:", userData);
      const res = await api.post("/manageuser", userData, getAuthConfig());
      console.log("📥 Received response:", res.data);
      
      // Handle both response formats: direct user object or wrapped in response
      const newUser = res.data.user || res.data;
      console.log("✅ Adding new user to list:", newUser);
      
      setUsers((prevUsers) => {
        const updated = [newUser, ...prevUsers];
        console.log("📊 Total users after add:", updated.length);
        return updated;
      });
      setError(null);
      
      // Optionally refresh the list to ensure sync
      await fetchUsers();
    } catch (err: any) {
      console.error("❌ Add user error:", err);
      console.error("Error response:", err.response?.data);
      throw err; // Re-throw to be handled in UserForm
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!editingUserId) return;
    try {
      const res = await api.put(`/manageuser/${editingUserId}`, userData, getAuthConfig());
      setUsers((p) => p.map((u) => (u._id === editingUserId ? res.data : u)));
      setEditingUserId(null);
      setError(null);
    } catch (err: any) {
      console.error("Update user error:", err);
      throw err; // Re-throw to be handled in UserForm
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`manageuser/${id}/status`, {}, getAuthConfig());
      setUsers((p) =>
        p.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
      );
      setError(null);
    } catch (err: any) {
      console.error("Toggle status error:", err);
      setError(err.response?.data?.message || "Failed to update user status");
    }
  };

  const filtered = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName?.toLowerCase().includes(search) ||
      u.username?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.section?.toLowerCase().includes(search);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / usersPerPage));
  const currentUsers = filtered.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  if (loading) return <div className="text-center py-10">Loading users...</div>;

  const currentUser = getCurrentUser();
  const isDepartmentHead = currentUser?.role === "departmentHead";

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Manage Users</h2>

      {/* Show filter info if coming from dashboard */}
      {(searchParams.get('role') || searchParams.get('status')) && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">
            🎯 <strong>Filtered View:</strong> 
            {searchParams.get('role') && ` Showing ${searchParams.get('role')}s`}
            {searchParams.get('status') && ` Showing ${searchParams.get('status')} users`}
            {' '}from dashboard
          </p>
        </div>
      )}

      {isDepartmentHead && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">
            📌 <strong>Department Head View:</strong> You can only view and manage users in your department: <strong>{currentUser.department}</strong>
          </p>
        </div>
      )}

      <UserForm onSubmit={handleAddUser} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          className="p-2 border rounded"
          placeholder="Search by name, username, email, or section"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
          <option value="departmentHead">Department Head</option>
          <option value="examCommittee">Exam Committee</option>
        </select>
        <select
          className="p-2 border rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}{" "}
          <button onClick={fetchUsers} className="underline font-semibold ml-2">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="p-3 text-left">Full Name</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Program</th>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center p-6 text-gray-500">
                  {users.length === 0
                    ? "No users found"
                    : "No users match your filters"}
                </td>
              </tr>
            )}
            {currentUsers.map((u) => (
              <tr key={u._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.fullName}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.department || "-"}</td>
                <td className="p-3">
                  {u.role === "student" ? u.year || "-" : "-"}
                </td>
                <td className="p-3">
                  {u.role === "student" ? u.programType || "-" : "-"}
                </td>
                <td className="p-3">
                  {u.role === "student" ? u.section || "-" : "-"}
                </td>
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
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(u._id, u.isActive)}
                    className={`text-sm ${
                      u.isActive
                        ? "text-orange-600 hover:text-orange-800"
                        : "text-green-600 hover:text-green-800"
                    } underline`}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUserId && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold text-lg mb-3">Edit User</h3>
          <UserForm
            onSubmit={handleUpdateUser}
            initialData={users.find((u) => u._id === editingUserId)}
            isEditing
            onCancel={() => setEditingUserId(null)}
          />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Prev
          </button>
          <span className="mx-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
