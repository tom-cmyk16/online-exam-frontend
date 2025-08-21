import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Loader2, PlusCircle, Edit2, Check, X } from "lucide-react";

interface Department {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
  department: Department; // populated object from backend
  year: string;
}

const ManageDepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [deptName, setDeptName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [selectedCourseDeptId, setSelectedCourseDeptId] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:5000/api/departments");
    setDepartments(res.data);
  };

  const fetchCourses = async () => {
    const res = await axios.get("http://localhost:5000/api/courses");
    setCourses(res.data);
  };

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const handleAddDepartment = async () => {
    if (!deptName.trim()) return;
    setLoading(true);
    await axios.post("http://localhost:5000/api/departments", {
      name: deptName,
    });
    setDeptName("");
    await fetchDepartments();
    setLoading(false);
  };

  const handleDeleteDepartment = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/departments/${id}`);
    await fetchDepartments();
  };

  const handleUpdateDepartment = async (id: string, name: string) => {
    await axios.put(`http://localhost:5000/api/departments/${id}`, { name });
    setEditDeptId(null);
    await fetchDepartments();
  };

  const handleAddCourse = async () => {
    if (!courseName.trim() || !selectedCourseDeptId || !courseYear.trim())
      return;
    setLoading(true);
    await axios.post("http://localhost:5000/api/courses", {
      name: courseName,
      department: selectedCourseDeptId,
      year: courseYear,
    });
    setCourseName("");
    setSelectedCourseDeptId("");
    setCourseYear("");
    await fetchCourses();
    setLoading(false);
  };

  const handleDeleteCourse = async (id: string) => {
    await axios.delete(`http://localhost:5000/api/courses/${id}`);
    await fetchCourses();
  };

  const handleUpdateCourse = async (
    id: string,
    name: string,
    deptId: string,
    year: string
  ) => {
    await axios.put(`http://localhost:5000/api/courses/${id}`, {
      name,
      department: deptId,
      year,
    });
    setEditCourseId(null);
    await fetchCourses();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Departments</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="New Department Name"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/3"
        />
        <button
          onClick={handleAddDepartment}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
          Add Department
        </button>
      </div>

      <ul className="mb-8 space-y-2">
        {departments.map((dept) => (
          <li
            key={dept._id}
            className="border p-2 rounded flex justify-between items-center"
          >
            {editDeptId === dept._id ? (
              <>
                <input
                  type="text"
                  value={dept.name}
                  onChange={(e) =>
                    setDepartments((prev) =>
                      prev.map((d) =>
                        d._id === dept._id ? { ...d, name: e.target.value } : d
                      )
                    )
                  }
                  className="border px-2 py-1 rounded w-1/2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateDepartment(dept._id, dept.name)}
                    className="text-green-500"
                  >
                    <Check />
                  </button>
                  <button
                    onClick={() => setEditDeptId(null)}
                    className="text-red-500"
                  >
                    <X />
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>{dept.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditDeptId(dept._id)}
                    className="text-blue-500"
                  >
                    <Edit2 />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept._id)}
                    className="text-red-500"
                  >
                    <Trash2 />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-bold mb-4">Manage Courses</h2>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="New Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/4"
        />
        <select
          value={selectedCourseDeptId}
          onChange={(e) => setSelectedCourseDeptId(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/4"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Year"
          value={courseYear}
          onChange={(e) => setCourseYear(e.target.value)}
          className="border px-4 py-2 rounded w-full sm:w-1/4"
        />
        <button
          onClick={handleAddCourse}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <PlusCircle />}
          Add Course
        </button>
      </div>

      <ul className="space-y-2">
        {courses.map((course) => {
          return (
            <li
              key={course._id}
              className="border p-2 rounded flex justify-between items-center"
            >
              {editCourseId === course._id ? (
                <>
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) =>
                      setCourses((prev) =>
                        prev.map((c) =>
                          c._id === course._id
                            ? { ...c, name: e.target.value }
                            : c
                        )
                      )
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <input
                    type="text"
                    value={course.year}
                    onChange={(e) =>
                      setCourses((prev) =>
                        prev.map((c) =>
                          c._id === course._id
                            ? { ...c, year: e.target.value }
                            : c
                        )
                      )
                    }
                    className="border px-2 py-1 rounded"
                  />
                  <select
                    value={course.department._id}
                    onChange={(e) =>
                      setCourses((prev) =>
                        prev.map((c) =>
                          c._id === course._id
                            ? {
                                ...c,
                                department: {
                                  _id: e.target.value,
                                  name:
                                    departments.find(
                                      (d) => d._id === e.target.value
                                    )?.name || "",
                                },
                              }
                            : c
                        )
                      )
                    }
                    className="border px-2 py-1 rounded"
                  >
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleUpdateCourse(
                          course._id,
                          course.name,
                          course.department._id,
                          course.year
                        )
                      }
                      className="text-green-500"
                    >
                      <Check />
                    </button>
                    <button
                      onClick={() => setEditCourseId(null)}
                      className="text-red-500"
                    >
                      <X />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span>
                    {course.name} - {course.department?.name || "Unknown"} -
                    Year: {course.year}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditCourseId(course._id)}
                      className="text-blue-500"
                    >
                      <Edit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="text-red-500"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ManageDepartmentPage;
