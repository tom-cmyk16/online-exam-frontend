import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  departments?: string[]; // initial departments optional
  selectedDepartments: string[];
  setSelectedDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  onAssignDepartments: () => void;
}

const AssignYears: React.FC<Props> = ({
  departments = [],
  selectedDepartments,
  setSelectedDepartments,
  onAssignDepartments,
}) => {
  const [localDepartments, setLocalDepartments] =
    useState<string[]>(departments);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((!departments || departments.length === 0) && !loading) {
      setLoading(true);
      axios
        .get("http://localhost:5000/api/departments")
        .then((res) => {
          setLocalDepartments(res.data || []);
        })
        .catch(() => {
          setLocalDepartments([]);
        })
        .finally(() => setLoading(false));
    }
  }, [departments, loading]);

  const listDepartments =
    departments.length > 0 ? departments : localDepartments;

  const handleCheckboxChange = (dept: string, checked: boolean) => {
    if (!Array.isArray(selectedDepartments)) return; // Defensive guard
    if (checked) {
      if (!selectedDepartments.includes(dept)) {
        setSelectedDepartments([...selectedDepartments, dept]);
      }
    } else {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== dept));
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Assign Exam to Departments
        </h2>
        <p>Loading departments...</p>
      </div>
    );
  }

  if (listDepartments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Assign Exam to Departments
        </h2>
        <p>No departments found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Assign Exam to Departments</h2>
      {listDepartments.map((dept) => (
        <div key={dept} className="flex items-center mb-1">
          <input
            type="checkbox"
            checked={
              Array.isArray(selectedDepartments) &&
              selectedDepartments.includes(dept)
            }
            onChange={(e) => handleCheckboxChange(dept, e.target.checked)}
            className="mr-2"
            id={dept}
          />
          <label htmlFor={dept}>{dept}</label>
        </div>
      ))}
      <button
        onClick={onAssignDepartments}
        className="w-full bg-blue-500 text-white p-2 rounded-md"
      >
        Assign
      </button>
    </div>
  );
};

export default AssignYears;
