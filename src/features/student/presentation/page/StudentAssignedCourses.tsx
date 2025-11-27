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
  department: Department | string | null;
}

const API_BASE = "http://localhost:5000/api";

const StudentAssignedCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  const [studentDept, setStudentDept] = useState<string | null>(null);
  const [studentStandard, setStudentStandard] = useState<string | null>(null);

  const [viewCourseId, setViewCourseId] = useState<string | null>(null);
  const [assignedInstructorsForCourse, setAssignedInstructorsForCourse] =
    useState<Instructor[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState<boolean>(false);

  useEffect(() => {
    // Load student department and standard from localStorage or fallback via /manageuser
    const storedDept = (localStorage.getItem("department") || "").trim();
    const storedStd = (localStorage.getItem("standard") || "").trim();
    if (storedDept) setStudentDept(storedDept);
    if (storedStd) setStudentStandard(storedStd);

    if (storedDept && storedStd) return;

    const username = localStorage.getItem("username");
    if (!username) return;

    axios
      .get(`${API_BASE}/manageuser`)
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : [];
        const u = list.find((it) => it.username === username);
        if (u) {
          if (!storedDept && u.department) {
            setStudentDept(u.department);
            try {
              localStorage.setItem("department", u.department);
            } catch {}
          }
          const std = (u.standard || u.year || "").toString().trim();
          if (!storedStd && std) {
            setStudentStandard(std);
            try {
              localStorage.setItem("standard", std);
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const res = await axios.get<Course[]>(`${API_BASE}/courses`);
        setCourses(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch {
        setError("Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const fetchAssignedInstructors = async (courseId: string) => {
    try {
      setLoadingAssigned(true);
      const res = await axios.get<Instructor[]>(
        `${API_BASE}/courses/${courseId}/assigned-instructors`
      );
      setAssignedInstructorsForCourse(Array.isArray(res.data) ? res.data : []);
      setViewCourseId(courseId);
      setError("");
    } catch {
      setError("Failed to load assigned instructors.");
    } finally {
      setLoadingAssigned(false);
    }
  };

  const handleToggleViewAssigned = (courseId: string) => {
    if (viewCourseId === courseId) {
      setViewCourseId(null);
      setAssignedInstructorsForCourse([]);
    } else {
      fetchAssignedInstructors(courseId);
    }
  };

  const visibleCourses = courses.filter((course) => {
    const deptName =
      course && course.department && typeof course.department === "object"
        ? (course.department as Department).name
        : "";

    const deptOk = studentDept
      ? deptName.toLowerCase() === studentDept.toLowerCase()
      : false;

    const stdOk = studentStandard
      ? typeof course.year === "string" &&
        course.year.toLowerCase() === studentStandard.toLowerCase()
      : true; // If student standard is unknown, don't block by year

    return deptOk && stdOk;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Assigned Courses</h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-4 mb-4 rounded">{error}</div>
      )}

      {loadingCourses ? (
        <p className="text-gray-600">Loading courses...</p>
      ) : !studentDept ? (
        <p className="text-gray-600">
          Student department not found. Ensure you're logged in and your
          department is set.
        </p>
      ) : visibleCourses.length === 0 ? (
        <p className="text-gray-600">No courses available for your profile.</p>
      ) : (
        <ul className="space-y-4">
          {visibleCourses.map((course) => (
            <li key={course._id} className="bg-white border p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-lg">
                  {course.name} - {" "}
                  {course.department && typeof course.department === "object"
                    ? (course.department as Department).name
                    : "Unknown Department"}{" "}
                  - Year {course.year}
                </div>
                <button
                  onClick={() => handleToggleViewAssigned(course._id)}
                  className="text-blue-500"
                  title="View Assigned Instructors"
                >
                  <Eye size={20} />
                </button>
              </div>

              {viewCourseId === course._id && (
                <div className="mt-2 pl-4 border-t pt-2">
                  {loadingAssigned ? (
                    <p className="text-gray-500 text-sm">
                      Loading assigned instructors...
                    </p>
                  ) : assignedInstructorsForCourse.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No instructors assigned.
                    </p>
                  ) : (
                    <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
                      {assignedInstructorsForCourse.map((inst) => (
                        <li key={inst._id}>{inst.fullName}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentAssignedCourses;
