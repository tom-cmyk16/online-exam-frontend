import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit2, Check, X, UserMinus, Eye } from "lucide-react";

interface Department {
  _id: string;
  name: string;
}

interface Instructor {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  department: string;
}

interface Course {
  _id: string;
  name: string;
  year: string;
  department: Department | string;
  // Remove assignedInstructors here, we will fetch it on demand
  // assignedInstructors: Instructor[];
}

const AssignInstructorPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(
    null
  );
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchInstructor, setSearchInstructor] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [error, setError] = useState("");
  const [editInstructorId, setEditInstructorId] = useState<string | null>(null);
  const [editInstructorData, setEditInstructorData] = useState<{
    fullName: string;
    email: string;
  }>({
    fullName: "",
    email: "",
  });

  // NEW: View course id and assigned instructors
  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [assignedInstructorsForCourse, setAssignedInstructorsForCourse] =
    useState<Instructor[]>([]);

  // Fetch courses, instructors, departments initially
  const fetchData = async () => {
    try {
      const [courseRes, userRes, deptRes] = await Promise.all([
        axios.get("http://localhost:5000/api/courses"),
        axios.get("http://localhost:5000/api/manageuser"),
        axios.get("http://localhost:5000/api/departments"),
      ]);

      setCourses(courseRes.data);
      setDepartments(deptRes.data);
      setInstructors(userRes.data.filter((u: any) => u.role === "instructor"));
      setError("");
    } catch {
      setError("Failed to load data from server.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Instructor CRUD functions (same as before)
  const startEditingInstructor = (inst: Instructor) => {
    setEditInstructorId(inst._id);
    setEditInstructorData({ fullName: inst.fullName, email: inst.email });
  };

  const handleUpdateInstructor = async () => {
    if (!editInstructorId) return;
    try {
      await axios.put(
        `http://localhost:5000/api/manageuser/${editInstructorId}`,
        {
          fullName: editInstructorData.fullName,
          email: editInstructorData.email,
        }
      );
      alert("Instructor updated successfully!");
      setEditInstructorId(null);
      fetchData();
    } catch {
      alert("Failed to update instructor.");
    }
  };

  const handleDeleteInstructor = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this instructor?"))
      return;
    try {
      await axios.delete(`http://localhost:5000/api/manageuser/${id}`);
      alert("Instructor deleted successfully!");
      fetchData();
    } catch {
      alert("Failed to delete instructor.");
    }
  };

  // Assign instructor to course
  const handleAssign = async () => {
    if (!selectedInstructor || !selectedCourse) {
      alert("Please select both an instructor and a course.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/assigning", {
        instructorId: selectedInstructor,
        courseId: selectedCourse,
      });
      alert("Instructor assigned successfully!");
      setSelectedInstructor(null);
      setSelectedCourse(null);
      fetchData();
      setAssignedInstructorsForCourse([]); // clear viewed instructors
      setViewCourseId(null);
    } catch {
      alert("Failed to assign instructor.");
    }
  };

  // Remove assigned instructor from course
  const handleRemoveAssignedInstructor = async (
    courseId: string,
    instructorId: string
  ) => {
    if (!window.confirm("Remove this instructor from the course?")) return;
    try {
      await axios.post("http://localhost:5000/api/assigning/remove", {
        instructorId,
        courseId,
      });
      alert("Instructor removed from course successfully!");
      // Refresh assigned instructors for that course
      if (viewCourseId === courseId) {
        fetchAssignedInstructors(courseId);
      }
    } catch {
      alert("Failed to remove instructor.");
    }
  };

  // Filter lists for search
  const filteredInstructors = instructors.filter(
    (inst) =>
      inst.fullName.toLowerCase().includes(searchInstructor.toLowerCase()) ||
      inst.username.toLowerCase().includes(searchInstructor.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchCourse.toLowerCase())
  );

  // Fetch assigned instructors for course on demand
  const fetchAssignedInstructors = async (courseId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/assigned-instructors`
      );
      setAssignedInstructorsForCourse(res.data);
      setViewCourseId(courseId);
    } catch {
      alert("Failed to load assigned instructors.");
    }
  };

  // Toggle view assigned instructors
  const handleViewAssignedInstructors = (courseId: string) => {
    if (viewCourseId === courseId) {
      setViewCourseId(null);
      setAssignedInstructorsForCourse([]);
    } else {
      fetchAssignedInstructors(courseId);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="bg-red-100 text-red-600 p-4 mb-4 rounded">{error}</div>
      )}

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instructors */}
          <div>
            <h3 className="font-semibold mb-2">Instructors</h3>
            <input
              type="text"
              placeholder="Search by name or username..."
              className="w-full border px-3 py-2 mb-3 rounded"
              value={searchInstructor}
              onChange={(e) => setSearchInstructor(e.target.value)}
            />
            <ul className="border rounded max-h-80 overflow-auto divide-y">
              {filteredInstructors.length === 0 ? (
                <li className="p-4 text-center text-gray-500">
                  No instructors found
                </li>
              ) : (
                filteredInstructors.map((inst) => (
                  <li key={inst._id} className="p-3 hover:bg-gray-50">
                    {editInstructorId === inst._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editInstructorData.fullName}
                          onChange={(e) =>
                            setEditInstructorData((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded w-full"
                        />
                        <input
                          type="email"
                          value={editInstructorData.email}
                          onChange={(e) =>
                            setEditInstructorData((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded w-full"
                        />
                        <div className="flex gap-2">
                          <button
                            className="text-green-500 flex items-center gap-1"
                            onClick={handleUpdateInstructor}
                          >
                            <Check size={16} /> Save
                          </button>
                          <button
                            className="text-red-500 flex items-center gap-1"
                            onClick={() => setEditInstructorId(null)}
                          >
                            <X size={16} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() =>
                          setSelectedInstructor(
                            selectedInstructor === inst._id ? null : inst._id
                          )
                        }
                        className={`cursor-pointer ${
                          selectedInstructor === inst._id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">{inst.fullName}</div>
                            <div className="text-sm text-gray-500">
                              @{inst.username}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="text-yellow-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingInstructor(inst);
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="text-red-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteInstructor(inst._id);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold mb-2">Courses</h3>
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full border px-3 py-2 mb-3 rounded"
              value={searchCourse}
              onChange={(e) => setSearchCourse(e.target.value)}
            />

            <ul className="space-y-4 max-h-80 overflow-auto border rounded divide-y p-2">
              {filteredCourses.length === 0 ? (
                <li className="p-4 text-center text-gray-500">
                  No courses found
                </li>
              ) : (
                filteredCourses.map((course) => (
                  <li key={course._id} className="border p-2 rounded">
                    <div className="flex justify-between items-center">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedCourse(
                            selectedCourse === course._id ? null : course._id
                          )
                        }
                      >
                        <span className="font-semibold">{course.name}</span> -{" "}
                        <span>
                          {typeof course.department === "object" &&
                          course.department
                            ? (course.department as Department).name
                            : typeof course.department === "string"
                            ? departments.find(
                                (d) => d._id === course.department
                              )?.name ||
                              course.department ||
                              "Unknown"
                            : "Unknown"}
                        </span>{" "}
                        - Year: <span>{course.year}</span>
                      </div>
                      <button
                        onClick={() =>
                          handleViewAssignedInstructors(course._id)
                        }
                        className="text-blue-500"
                        title="View Assigned Instructors"
                      >
                        <Eye size={18} />
                      </button>
                    </div>

                    {viewCourseId === course._id && (
                      <div className="mt-2 pl-4 border-t pt-2">
                        <h4 className="font-semibold mb-1">
                          Assigned Instructors:
                        </h4>
                        {assignedInstructorsForCourse.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No instructors assigned.
                          </p>
                        ) : (
                          <ul className="space-y-1">
                            {assignedInstructorsForCourse.map((inst) => (
                              <li
                                key={inst._id}
                                className="flex justify-between items-center border p-1 rounded"
                              >
                                <span>{inst.fullName}</span>
                                <button
                                  onClick={() =>
                                    handleRemoveAssignedInstructor(
                                      course._id,
                                      inst._id
                                    )
                                  }
                                  className="text-red-500"
                                  title="Remove Instructor"
                                >
                                  <UserMinus size={16} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleAssign}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            disabled={!selectedInstructor || !selectedCourse}
          >
            Assign Instructor to Course
          </button>
        </div>
      </div>
    </div>
  );
};
export default AssignInstructorPage;
