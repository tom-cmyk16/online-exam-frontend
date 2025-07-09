import { useState } from "react";
import logo from "../../../../assets/logo.png";
import Button from "../../../../core/components/button";

type UserRole = "student" | "instructor" | "admin" | "exam_committee";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("student");

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, userRole });
    // TODO: Add login logic
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResetMessage(`Password reset link sent to ${resetEmail}`);
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage("");
      }, 3000);
    } catch {
      setResetMessage("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
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

          {showResetForm ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Reset Password
              </h2>

              {resetMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    resetMessage.includes("Failed")
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {resetMessage}
                </div>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" loading={isLoading}>
                  Send Reset Link
                </Button>

                <Button
                  type="button"
                  variant="text"
                  onClick={() => setShowResetForm(false)}
                >
                  Back to Login
                </Button>
              </form>
            </>
          ) : (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
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

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Login as
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                    <option value="exam_committee">Exam Committee</option>
                  </select>
                </div>

                <Button type="submit">Login</Button>

                <Button
                  type="button"
                  variant="text"
                  className="text-sm"
                  onClick={() => setShowResetForm(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
