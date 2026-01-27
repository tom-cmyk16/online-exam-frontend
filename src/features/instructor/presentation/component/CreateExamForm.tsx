import React, { ChangeEvent, FC } from "react";

interface ExamData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  // standard and activeTime removed
}

interface Props {
  newExamData: ExamData;
  setNewExamData: React.Dispatch<React.SetStateAction<ExamData>>;
  onCreateExam: () => void;
}

const CreateExamForm: FC<Props> = ({
  newExamData,
  setNewExamData,
  onCreateExam,
}) => {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewExamData({ ...newExamData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mb-6">
      <h2 className="text-2xl font-semibold mb-4">Create New Exam</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={newExamData.title}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={newExamData.description}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />
      <div className="flex space-x-4 mb-4">
        <div className="flex flex-col w-1/2">
          <label htmlFor="startTime" className="mb-1 font-medium">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            id="startTime"
            value={newExamData.startTime}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex flex-col w-1/2">
          <label htmlFor="endTime" className="mb-1 font-medium">
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            id="endTime"
            value={newExamData.endTime}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>
      </div>

      <button
        onClick={onCreateExam}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
      >
        Create Exam
      </button>
    </div>
  );
};

export default CreateExamForm;
