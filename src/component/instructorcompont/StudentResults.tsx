import React from "react";

const StudentResults: React.FC = () => {
  const results = [
    { name: "Jane Doe", studentId: "ST1001", score: 88 },
    { name: "John Smith", studentId: "ST1002", score: 75 },
    { name: "Sara Ali", studentId: "ST1003", score: 92 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Student ID</th>
            <th className="p-2 border">Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((res, idx) => (
            <tr key={idx}>
              <td className="p-2 border">{res.name}</td>
              <td className="p-2 border">{res.studentId}</td>
              <td className="p-2 border">{res.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentResults;
