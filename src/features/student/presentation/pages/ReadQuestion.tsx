// File: src/pages/student/ReadQuestion.jsx

const ReadQuestion = () => {
  const questions = [
    { id: 1, question: "What is JSX in React?" },
    { id: 2, question: "Explain React hooks briefly." },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-blue-700 mb-4">
        Read Questions
      </h1>
      <ul className="space-y-2">
        {questions.map((q) => (
          <li key={q.id} className="bg-white p-4 rounded shadow">
            {q.question}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReadQuestion;
