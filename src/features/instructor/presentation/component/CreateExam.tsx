// pages/instructor/CreateExam.tsx
import React, { useState, ChangeEvent } from "react";
import "./CreateExam.css";

type QuestionType = "multiple_choice" | "true_false" | "essay";

interface Question {
  text: string;
  type: QuestionType;
  marks: number;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
}

interface Exam {
  title: string;
  course: string;
  department: string;
  academicYear: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  questions: Question[];
}

const CreateExam: React.FC = () => {
  const [examData, setExamData] = useState<Exam>({
    title: "",
    course: "",
    department: "",
    academicYear: "",
    duration: 60,
    totalMarks: 100,
    instructions: "",
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    text: "",
    type: "multiple_choice",
    marks: 1,
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
  });

  const addQuestion = () => {
    if (currentQuestion.text.trim() === "") return;

    setExamData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }],
    }));

    // Reset current question
    setCurrentQuestion({
      text: "",
      type: "multiple_choice",
      marks: 1,
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "medium",
    });
  };

  const handleExamChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]:
        name === "duration" || name === "totalMarks" ? parseInt(value) : value,
    }));
  };

  const handleQuestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("option") && index !== undefined) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    } else {
      setCurrentQuestion({ ...currentQuestion, [name]: value });
    }
  };

  const submitForApproval = () => {
    console.log("Submitting exam:", examData);
    alert("Exam submitted to committee for approval!");
    // Replace this with your API call to submit the exam
  };

  return (
    <div className="create-exam">
      <div className="page-header">
        <h1>Create New Exam</h1>
        <p>Create and submit exams for committee approval</p>
      </div>

      <div className="exam-form">
        {/* Exam Details */}
        <div className="form-section">
          <h3>Exam Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Exam Title</label>
              <input
                type="text"
                name="title"
                value={examData.title}
                onChange={handleExamChange}
                placeholder="Enter exam title"
              />
            </div>
            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={examData.course}
                onChange={handleExamChange}
                placeholder="Enter course name"
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={examData.department}
                onChange={handleExamChange}
              >
                <option value="">Select Department</option>
                <option value="computer_science">Computer Science</option>
                <option value="mathematics">Mathematics</option>
                <option value="physics">Physics</option>
              </select>
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={examData.academicYear}
                onChange={handleExamChange}
                placeholder="e.g., 2024-2025"
              />
            </div>
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={examData.duration}
                onChange={handleExamChange}
              />
            </div>
            <div className="form-group">
              <label>Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={examData.totalMarks}
                onChange={handleExamChange}
              />
            </div>
          </div>
        </div>

        {/* Add Questions */}
        <div className="form-section">
          <h3>Add Questions</h3>
          <div className="question-form">
            <div className="form-group">
              <label>Question Text</label>
              <textarea
                name="text"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>

            <div className="question-options">
              <div className="form-group">
                <label>Question Type</label>
                <select
                  name="type"
                  value={currentQuestion.type}
                  onChange={handleQuestionChange}
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              {currentQuestion.type === "multiple_choice" && (
                <div className="options-grid">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: index,
                          })
                        }
                      />
                      <input
                        type="text"
                        name={`option${index}`}
                        value={option}
                        onChange={(e) => handleQuestionChange(e, index)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="add-question-btn" onClick={addQuestion}>
              Add Question
            </button>
          </div>
        </div>

        {/* Questions List */}
        {examData.questions.length > 0 && (
          <div className="questions-list">
            <h3>Added Questions ({examData.questions.length})</h3>
            {examData.questions.map((q, index) => (
              <div key={index} className="question-item">
                <div className="question-header">
                  <span>
                    Q{index + 1}. {q.text}
                  </span>
                  <span>{q.marks} marks</span>
                </div>
                {q.type === "multiple_choice" && (
                  <div className="question-options-list">
                    {q.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option ${
                          optIndex === q.correctAnswer ? "correct" : ""
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button className="btn-primary" onClick={submitForApproval}>
            Submit to Committee
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
