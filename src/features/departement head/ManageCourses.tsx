import React, { useState, useEffect } from "react";
import axios from "axios";

// ---------- Types ----------
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

interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  year: string;
  credits: number;
  instructor?: string;
  programType: string;
  sections?: string[];
}

// ---------- Config ----------
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token") || "";
const getAxiosConfig = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

// ---------- Department Dashboard ----------
const DepartmentDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const currentUserRole = localStorage.getItem("role") || "";
  const currentUserDepartment = localStorage.getItem("department") || "";

  const [courseForm, setCourseForm] = useState({
    courseCode: "",
    courseName: "",
    department:
      currentUserRole === "departmentHead" ? currentUserDepartment : "",
    year: "",
    credits: 0,
    instructor: "",
    programType: "regular",
    sections: "",
  });

  const [searchCourse, setSearchCourse] = useState("");
  const [searchUser, setSearchUser] = useState("");

  // ---------- Fetch Users ----------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get<User[]>(
        `${API_BASE}/manageuser`,
        getAxiosConfig()
      );
      let data = res.data;
      if (currentUserRole === "departmentHead") {
        data = data.filter(
          (u) =>
            u.department === currentUserDepartment && u.role === "instructor"
        );
      }
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch Courses ----------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, deptRes] = await Promise.all([
        axios.get<Course[]>(`${API_BASE}/courses`, getAxiosConfig()),
        axios.get<{ name: string }[]>(`${API_BASE}/departments`, getAxiosConfig()),
      ]);

      let coursesData = coursesRes.data;
      if (currentUserRole === "departmentHead") {
        coursesData = coursesData.filter(
          (c) => c.department === currentUserDepartment
        );
      }

      setCourses(coursesData);
      setDepartments(deptRes.data.map((d) => d.name));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []);

  // ---------- Course Handlers ----------
  const handleCourseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCourseForm({ ...courseForm, [e.target.name]: e.target.value });
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCourseId ? "put" : "post";
      const url = editingCourseId
        ? `${API_BASE}/courses/${editingCourseId}`
        : `${API_BASE}/courses`;

      const payload = {
        ...courseForm,
        credits: Number(courseForm.credits),
        sections: courseForm.sections
          ? courseForm.sections.split(",").map((s) => s.trim())
          : [],
      };
      const res = await axios[method](url, payload, getAxiosConfig());

      if (editingCourseId) {
        setCourses((prev) =>
          prev.map((c) => (c._id === editingCourseId ? res.data : c))
        );
        setEditingCourseId(null);
      } else setCourses((prev) => [res.data, ...prev]);

      setCourseForm({
        courseCode: "",
        courseName: "",
        department:
          currentUserRole === "departmentHead" ? currentUserDepartment : "",
        year: "",
        credits: 0,
        instructor: "",
        programType: "regular",
        sections: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseEdit = (c: Course) => {
    setEditingCourseId(c._id);
    setCourseForm({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department,
      year: c.year,
      credits: c.credits,
      instructor: c.instructor || "",
      programType: c.programType,
      sections: c.sections?.join(", ") || "",
    });
  };

  // ---------- User Status Toggle ----------
  const handleUserStatusToggle = async (id: string, currentStatus: boolean) => {
    await axios.patch(`${API_BASE}/manageuser/${id}/status`, {}, getAxiosConfig());
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: !currentStatus } : u))
    );
  };

  // ---------- Filtering ----------
  const filteredCourses = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      {/* ---------------- Courses ---------------- */}
      <h2 className="text-xl font-bold text-green-800 mb-4">
        Department Courses
      </h2>

      <form
        onSubmit={handleCourseSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
      >
        <input
          name="courseCode"
          value={courseForm.courseCode}
          onChange={handleCourseChange}
          placeholder="Course Code"
          required
          className="p-2 border rounded"
        />
        <input
          name="courseName"
          value={courseForm.courseName}
          onChange={handleCourseChange}
          placeholder="Course Name"
          required
          className="p-2 border rounded"
        />
        {currentUserRole !== "departmentHead" ? (
          <select
            name="department"
            value={courseForm.department}
            onChange={handleCourseChange}
            className="p-2 border rounded"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={courseForm.department}
            readOnly
            className="p-2 border bg-green-100 text-green-800 rounded"
          />
        )}
        <input
          name="year"
          value={courseForm.year}
          onChange={handleCourseChange}
          placeholder="Year"
          required
          className="p-2 border rounded"
        />
        <input
          name="credits"
          type="number"
          value={courseForm.credits}
          onChange={handleCourseChange}
          placeholder="Credits"
          required
          className="p-2 border rounded"
        />
        <select
          name="instructor"
          value={courseForm.instructor}
          onChange={handleCourseChange}
          className="p-2 border rounded"
        >
          <option value="">Select Instructor</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.fullName}
            </option>
          ))}
        </select>
        <select
          name="programType"
          value={courseForm.programType}
          onChange={handleCourseChange}
          className="p-2 border rounded"
        >
          <option value="regular">Regular</option>
          <option value="extension">Extension</option>
          <option value="summer">Summer</option>
        </select>
        <input
          name="sections"
          value={courseForm.sections}
          onChange={handleCourseChange}
          placeholder="Sections (A,B,C)"
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="col-span-3 bg-green-600 text-white p-2 rounded"
        >
          {editingCourseId ? "Update Course" : "Add Course"}
        </button>
      </form>

      <input
        placeholder="Search Courses..."
        value={searchCourse}
        onChange={(e) => setSearchCourse(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />
      <table className="min-w-full border mb-8">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Code</th>
            <th className="p-2">Name</th>
            <th className="p-2">Dept</th>
            <th className="p-2">Year</th>
            <th className="p-2">Credits</th>
            <th className="p-2">Instructor</th>
            <th className="p-2">Program</th>
            <th className="p-2">Sections</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((c) => (
            <tr key={c._id} className="border-b hover:bg-green-50">
              <td className="p-2">{c.courseCode}</td>
              <td className="p-2">{c.courseName}</td>
              <td className="p-2">{c.department}</td>
              <td className="p-2">{c.year}</td>
              <td className="p-2">{c.credits}</td>
              <td className="p-2">
                {users.find((u) => u._id === c.instructor)?.fullName || "-"}
              </td>
              <td className="p-2">{c.programType}</td>
              <td className="p-2">{c.sections?.join(", ")}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleCourseEdit(c)}
                  className="text-blue-600 underline text-sm"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------------- Users ---------------- */}
      <h2 className="text-xl font-bold text-green-800 mb-4">
        Department Users
      </h2>
      <input
        placeholder="Search Users..."
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />
      <table className="min-w-full border">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Dept</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr
              key={u._id}
              className={`border-b hover:${
                u.role === "instructor" ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <td className="p-2">{u.fullName}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2 capitalize">{u.role}</td>
              <td className="p-2">{u.department}</td>
              <td className="p-2">
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
              <td className="p-2 space-x-2">
                <button
                  onClick={() => handleUserStatusToggle(u._id, u.isActive)}
                  className="text-sm"
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentDashboard;
