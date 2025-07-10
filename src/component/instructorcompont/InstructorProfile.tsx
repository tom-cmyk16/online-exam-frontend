import React from "react";

const InstructorProfile: React.FC = () => {
  const instructor = {
    name: "Dr. Meron Alemu",
    email: "meron@dtu.edu.et",
    department: "Computer Science",
    phone: "+251 911 234 567",
    office: "Room 202, Block C",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Instructor Profile
      </h2>
      <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Name: </span>
          {instructor.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Email: </span>
          {instructor.email}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Department: </span>
          {instructor.department}
        </div>
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Phone: </span>
          {instructor.phone}
        </div>
        <div>
          <span className="font-semibold text-gray-700">Office: </span>
          {instructor.office}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile;
