import React from "react";
import { Exam } from "../page/ExamManagement";
interface Props {
  exams: Exam[];
  setCurrentExamId: React.Dispatch<React.SetStateAction<number | null>>;
}

const ExamList: React.FC<Props> = ({ exams, setCurrentExamId }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Exam List</h2>
      {exams.length === 0 ? (
        <p>No exams created yet.</p>
      ) : (
        <ul>
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="cursor-pointer mb-2 p-2 border rounded hover:bg-gray-100"
              onClick={() => setCurrentExamId(exam.id)}
            >
              <strong>{exam.title}</strong> - {exam.standard} <br />
              Assigned Years:{" "}
              {exam.assignedYears.length > 0
                ? exam.assignedYears.join(", ")
                : "None"}
              <br />
              Questions: {exam.questions.length}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExamList;
