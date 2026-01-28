import React, { useState, useEffect } from "react";
import axios from "axios";

// ---------- Types ----------
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
const axiosConfig = { headers: { Authorization: `Bearer ${getToken()}` } };

const InstructorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCourse, setSearchCourse] = useState("");

  const instructorId = localStorage.getItem("userId"); // store user ID on login

  // ---------- Fetch Instructor Courses ----------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Course[]>(`${API_BASE}/courses`, axiosConfig);
      const assignedCourses = res.data.filter(
        (c) => c.instructor === instructorId
      );
      setCourses(assignedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // ---------- Filtered Courses ----------
  const filteredCourses = courses.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(searchCourse.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchCourse.toLowerCase())
  );

  if (loading) return <p className="text-center mt-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold text-green-800 mb-4">
        My Assigned Courses
      </h2>

      <input
        placeholder="Search Courses..."
        value={searchCourse}
        onChange={(e) => setSearchCourse(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />

      <table className="min-w-full border">
        <thead className="bg-green-100">
          <tr>
            <th className="p-2">Code</th>
            <th className="p-2">Name</th>
            <th className="p-2">Dept</th>
            <th className="p-2">Year</th>
            <th className="p-2">Credits</th>
            <th className="p-2">Program</th>
            <th className="p-2">Sections</th>
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
              <td className="p-2">{c.programType}</td>
              <td className="p-2">{c.sections?.join(", ") || "-"}</td>
            </tr>
          ))}
          {filteredCourses.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-6 text-gray-500">
                You have no assigned courses.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InstructorCoursesPage;
