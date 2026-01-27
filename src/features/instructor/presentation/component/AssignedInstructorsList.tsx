<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

interface Instructor {
  _id: string;
  fullName: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
  year: string;
  department: Department | string;
}

const AssignedInstructorsList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [assignedInstructors, setAssignedInstructors] = useState<Instructor[]>(
    []
  );
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await axios.get("http://localhost:5000/api/courses");
      setCourses(res.data);
      setError("");
    } catch {
      setError("Failed to load courses.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAssignedInstructors = async (courseId: string) => {
    setLoadingAssigned(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/assigned-instructors`
      );
      setAssignedInstructors(res.data);
      setViewCourseId(courseId);
      setError("");
    } catch {
      setError("Failed to load assigned instructors.");
    } finally {
      setLoadingAssigned(false);
    }
  };

  const toggleAssignedInstructors = (courseId: string) => {
    if (viewCourseId === courseId) {
      setViewCourseId(null);
      setAssignedInstructors([]);
    } else {
      fetchAssignedInstructors(courseId);
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

<<<<<<< HEAD
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
=======
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {loadingCourses ? (
        <p className="text-gray-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses available.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">
                    {course.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Department:{" "}
                    {course.department && typeof course.department === "object"
                      ? (course.department as Department).name
                      : "Unknown"}{" "}
                    | Year: {course.year}
                  </p>
                </div>
                <button
                  onClick={() => toggleAssignedInstructors(course._id)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View Assigned Instructors"
                >
                  <Eye size={20} />
                </button>
              </div>

              {viewCourseId === course._id && (
                <div className="mt-4 pl-4 border-l border-gray-300">
                  {loadingAssigned ? (
                    <p className="text-gray-500 text-sm">
                      Loading assigned instructors...
                    </p>
                  ) : assignedInstructors.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No instructors assigned.
                    </p>
                  ) : (
                    <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                      {assignedInstructors.map((inst) => (
                        <li key={inst._id}>{inst.fullName}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
    </div>
  );
};

<<<<<<< HEAD
export default InstructorCoursesPage;
=======
export default AssignedInstructorsList;
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
