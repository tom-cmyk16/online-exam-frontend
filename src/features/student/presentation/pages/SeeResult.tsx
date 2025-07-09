const SeeResult = () => {
  const results = [
    { id: 1, subject: "Math", score: 85 },
    { id: 2, subject: "English", score: 90 },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold text-blue-700 mb-4">See Results</h1>
      <ul className="space-y-2">
        {results.map((result) => (
          <li key={result.id} className="bg-white p-4 rounded shadow">
            {result.subject}: <strong>{result.score}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};
