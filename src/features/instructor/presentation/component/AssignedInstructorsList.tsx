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
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
    </div>
  );
};

export default AssignedInstructorsList;
