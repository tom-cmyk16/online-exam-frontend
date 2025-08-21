import React, { ChangeEvent, FC } from "react";

interface Props {
  newQuestionData: {
    text: string;
    type: "text" | "multiple-choice";
    options: string[];
    correctAnswer: string;
  };
  setNewQuestionData: React.Dispatch<
    React.SetStateAction<{
      text: string;
      type: "text" | "multiple-choice";
      options: string[];
      correctAnswer: string;
    }>
  >;
  onAddQuestion: () => void;
}

const QuestionForm: FC<Props> = ({
  newQuestionData,
  setNewQuestionData,
  onAddQuestion,
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewQuestionData({ ...newQuestionData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newQuestionData.options];
    newOptions[index] = value;
    setNewQuestionData({ ...newQuestionData, options: newOptions });
  };

  const addOption = () => {
    setNewQuestionData({
      ...newQuestionData,
      options: [...newQuestionData.options, ""],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = newQuestionData.options.filter((_, i) => i !== index);
    setNewQuestionData({ ...newQuestionData, options: newOptions });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mb-6">
      <h2 className="text-2xl font-semibold mb-4">Add Question</h2>
      <textarea
        name="text"
        placeholder="Question Text"
        value={newQuestionData.text}
        onChange={(e) =>
          setNewQuestionData({ ...newQuestionData, text: e.target.value })
        }
        className="w-full mb-3 p-2 border rounded"
      />

      <select
        name="type"
        value={newQuestionData.type}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      >
        <option value="text">Text</option>
        <option value="multiple-choice">Multiple Choice</option>
      </select>

      {newQuestionData.type === "multiple-choice" && (
        <div className="mb-3">
          {newQuestionData.options.map((option, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className="flex-grow p-2 border rounded"
              />
              <button
                onClick={() => removeOption(idx)}
                className="ml-2 bg-red-600 text-white px-3 py-1 rounded"
                type="button"
              >
                X
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="bg-blue-600 text-white px-3 py-1 rounded"
            type="button"
          >
            Add Option
          </button>
        </div>
      )}

      <input
        type="text"
        name="correctAnswer"
        placeholder="Correct Answer"
        value={newQuestionData.correctAnswer}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={onAddQuestion}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Add Question
      </button>
    </div>
  );
};

export default QuestionForm;
