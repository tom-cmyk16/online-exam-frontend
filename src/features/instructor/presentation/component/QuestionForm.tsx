import React, { useState } from "react";

const QuestionForm: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion = {
      question,
      options,
      correctAnswer: options[correctIndex],
      deadline,
    };
    console.log("Submitting question:", newQuestion);
    // TODO: Send to backend (e.g., Firebase)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-medium text-gray-700">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="font-medium text-gray-700">Options</label>
        {options.map((opt, idx) => (
          <input
            key={idx}
            value={opt}
            onChange={(e) =>
              setOptions((prev) => {
                const updated = [...prev];
                updated[idx] = e.target.value;
                return updated;
              })
            }
            placeholder={`Option ${idx + 1}`}
            className="block w-full mt-1 p-2 border rounded mb-2"
            required
          />
        ))}
      </div>

      <div>
        <label className="font-medium text-gray-700">Correct Option</label>
        <select
          value={correctIndex}
          onChange={(e) => setCorrectIndex(Number(e.target.value))}
          className="w-full mt-1 p-2 border rounded"
        >
          {options.map((_, idx) => (
            <option key={idx} value={idx}>
              Option {idx + 1}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-medium text-gray-700">Upload Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Upload Question
      </button>
    </form>
  );
};

export default QuestionForm;
