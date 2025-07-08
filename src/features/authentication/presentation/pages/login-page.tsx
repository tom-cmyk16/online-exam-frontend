import { useState } from "react";
import logo from "../../../../assets/logo.png"; // ✅ Adjust this path if needed

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("student"); // Default to 'student'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // co
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("User Role:", userRole);
    // TODO: Add login logic here
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🔐 Login Form Container */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          {/* 🔵 Logo and Welcome Text */}
          <img
            src={logo}
            alt="Debre Tabor University Logo"
            className="w-24 h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-blue-900 mb-2 text-center">
            Online Course Examination
            <br />
            Debre Tabor University
          </h1>

          {/* 📝 Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* User Role Selection */}
            <div>
              <label
                htmlFor="user-role"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Login as
              </label>
              <select
                id="user-role"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="exam_committee">Exam Committee</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          {/* Removed: Footer Links (Forgot password, Create account) */}
          {/* <div className="mt-6 text-center text-sm text-gray-600">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline block mb-2"
            >
              Forgot your password?
            </a>
            <span>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Create Account
              </a>
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
