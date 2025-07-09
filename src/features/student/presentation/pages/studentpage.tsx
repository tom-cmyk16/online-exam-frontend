import React, { useState, type ChangeEvent, type FormEvent } from "react";
import {
  FaUser,
  FaLock,
  FaQuestion,
  FaPaperPlane,
  FaChartBar,
} from "react-icons/fa";

interface StudentInfo {
  name: string;
  department: string;
  email: string;
  profileImage: string | null;
}

const defaultStudent: StudentInfo = {
  name: "John Doe",
  department: "Computer Science",
  email: "john@example.com",
  profileImage: null,
};

const ReadQuestion: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4">📘 Read Question</h2>
    <p className="text-gray-700">Here you can read your assigned questions.</p>
  </div>
);

const SubmitAnswer: React.FC = () => {
  const [answer, setAnswer] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("Answer submitted: " + answer);
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">✏️ Submit Answer</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here"
          rows={6}
          className="w-full border p-3 rounded mb-4"
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
    </div>
  );
};

const SeeResult: React.FC = () => {
  const results = [
    { course: "Math 101", score: 85 },
    { course: "Physics 201", score: 90 },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📊 See Result</h2>
      <ul>
        {results.map((r, i) => (
          <li key={i} className="mb-2 text-gray-700">
            <strong>{r.course}</strong>: {r.score}%
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChangePass: React.FC<{ student: StudentInfo }> = ({ student }) => {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed!");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🔐 Change Password</h2>

      <div className="flex items-center gap-4 mb-4">
        {student.profileImage ? (
          <img
            src={student.profileImage}
            className="w-16 h-16 rounded-full"
            alt="Profile"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-sm">
            No Img
          </div>
        )}
        <div>
          <p className="font-semibold">{student.name}</p>
          <p className="text-sm text-gray-500">{student.department}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Current Password"
          className="w-full border p-2 rounded mb-3"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded mb-3"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full border p-2 rounded mb-4"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
        />
        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Change Password
        </button>
      </form>
    </div>
  );
};

const StudentProfile: React.FC<{
  student: StudentInfo;
  updateStudent: (info: StudentInfo) => void;
}> = ({ student, updateStudent }) => {
  const [name, setName] = useState(student.name);
  const [department, setDepartment] = useState(student.department);
  const [email, setEmail] = useState(student.email);
  const [profileImage, setProfileImage] = useState<string | null>(
    student.profileImage
  );

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateStudent({ name, department, email, profileImage });
    alert("Profile updated!");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">👤 Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 flex gap-4 items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              No Img
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          className="w-full border p-2 rounded mb-3"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          type="email"
          className="w-full border p-2 rounded mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
          Save Changes
        </button>
      </form>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState("read");
  const [student, setStudent] = useState<StudentInfo>(defaultStudent);

  const renderPage = () => {
    switch (activePage) {
      case "read":
        return <ReadQuestion />;
      case "submit":
        return <SubmitAnswer />;
      case "result":
        return <SeeResult />;
      case "change":
        return <ChangePass student={student} />;
      case "profile":
        return <StudentProfile student={student} updateStudent={setStudent} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          {student.profileImage ? (
            <img
              src={student.profileImage}
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-600 rounded-full mb-2 flex items-center justify-center text-sm">
              No Img
            </div>
          )}
          <p className="font-bold">{student.name}</p>
          <p className="text-sm text-gray-300">{student.department}</p>
        </div>

        {/* Navigation Buttons */}
        <nav className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => setActivePage("read")}
            className="flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            <FaQuestion size={20} /> Read Question
          </button>
          <button
            onClick={() => setActivePage("submit")}
            className="flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            <FaPaperPlane size={20} /> Submit Answer
          </button>
          <button
            onClick={() => setActivePage("result")}
            className="flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            <FaChartBar size={20} /> See Result
          </button>
          <button
            onClick={() => setActivePage("change")}
            className="flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            <FaLock size={20} /> Change Password
          </button>
          <button
            onClick={() => setActivePage("profile")}
            className="flex items-center gap-3 p-2 bg-gray-800 hover:bg-gray-700 rounded"
          >
            <FaUser size={20} /> Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-8">{renderPage()}</main>
    </div>
  );
};

export default StudentDashboard;
