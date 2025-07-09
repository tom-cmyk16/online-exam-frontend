import { useState } from "react";

const SubmitAnswer = () => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    alert("Answer submitted: " + answer);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-blue-700 mb-4">
        Submit Answer
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border p-2 rounded"
          rows="4"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your answer here..."
        ></textarea>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};
