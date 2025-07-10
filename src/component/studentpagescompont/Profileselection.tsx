import React from "react";

interface Student {
  name: string;
  email: string;
  department: string;
  studentId: string;
}

interface ProfileSectionProps {
  activeTab: "profile" | "edit";
  studentData: Student;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  activeTab,
  studentData,
  onChange,
  onSave,
}) => {
  if (activeTab === "profile") {
    return (
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Profile</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Name:</strong> {studentData.name}
          </p>
          <p>
            <strong>Email:</strong> {studentData.email}
          </p>
          <p>
            <strong>Department:</strong> {studentData.department}
          </p>
          <p>
            <strong>Student ID:</strong> {studentData.studentId}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
        Edit Profile
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="space-y-4"
      >
        {["name", "email", "department"].map((field) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-sm font-medium mb-1 capitalize"
            >
              {field}
            </label>
            <input
              id={field}
              name={field}
              type={field === "email" ? "email" : "text"}
              value={(studentData as any)[field]}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </form>
    </section>
  );
};

export default ProfileSection;
