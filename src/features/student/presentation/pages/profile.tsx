const Profile = () => {
  const student = {
    name: "Jane Doe",
    email: "jane@student.com",
    department: "Information Technology",
    year: "3rd Year",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-800">Profile</h1>
      <div className="bg-white rounded shadow p-4 space-y-2">
        <p>
          <strong>Name:</strong> {student.name}
        </p>
        <p>
          <strong>Email:</strong> {student.email}
        </p>
        <p>
          <strong>Department:</strong> {student.department}
        </p>
        <p>
          <strong>Year:</strong> {student.year}
        </p>
      </div>
    </div>
  );
};
