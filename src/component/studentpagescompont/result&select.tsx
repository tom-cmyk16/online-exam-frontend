import React from "react";

interface Exam {
  id: number;
  title: string;
  date: string;
  status: "completed" | "upcoming";
}

interface Result {
  examId: number;
  examTitle: string;
  score: number;
  maxScore: number;
  passed: boolean;
}

interface ResultsAndSubmitSectionProps {
  activeTab: "results" | "submit";
  results: Result[];
  exams: Exam[];
  answerExamId: number | null;
  answerText: string;
  onExamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmitAnswer: (e: React.FormEvent) => void;
}

const ResultsAndSubmitSection: React.FC<ResultsAndSubmitSectionProps> = ({
  activeTab,
  results,
  exams,
  answerExamId,
  answerText,
  onExamChange,
  onAnswerChange,
  onSubmitAnswer,
}) => {
  if (activeTab === "results") {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Exam Results
        </h2>
        {results.length === 0 ? (
          <p className="text-gray-600">No results available.</p>
        ) : (
          <ul className="space-y-4">
            {results.map((res) => (
              <li
                key={res.examId}
                className={`p-4 rounded-lg border ${
                  res.passed
                    ? "bg-green-100 border-green-400"
                    : "bg-red-100 border-red-400"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{res.examTitle}</h3>
                    <p className="text-gray-600">
                      Score: {res.score} / {res.maxScore}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      res.passed
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {res.passed ? "Passed" : "Failed"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
        Submit Answer
      </h2>
      <form onSubmit={onSubmitAnswer} className="space-y-4">
        <div>
          <label
            htmlFor="exam-select"
            className="block text-sm font-medium mb-1"
          >
            Select Exam
          </label>
          <select
            id="exam-select"
            value={answerExamId ?? ""}
            onChange={onExamChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
              -- Select an exam --
            </option>
            {exams
              .filter((exam) => exam.status === "upcoming")
              .map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({new Date(exam.date).toLocaleDateString()})
                </option>
              ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="answer-text"
            className="block text-sm font-medium mb-1"
          >
            Your Answer
          </label>
          <textarea
            id="answer-text"
            rows={6}
            value={answerText}
            onChange={onAnswerChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Submit Answer
        </button>
      </form>
    </section>
  );
};

export default ResultsAndSubmitSection;
