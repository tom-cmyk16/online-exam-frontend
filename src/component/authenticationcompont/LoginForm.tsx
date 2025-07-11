import React from "react";
import Button from "../../component/studentpagescompont/Buttons";

interface LoginFormProps {
  username: string;
  password: string;
  userRole: string;np
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onForgotPasswordClick: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  userRole,
  onUsernameChange,
  onPasswordChange,
  onUserRoleChange,
  onSubmit,
  isLoading,
  onForgotPasswordClick,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Username
      </label>
      <input
        type="text"
        placeholder="Enter your username"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={username}
        onChange={onUsernameChange}
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
        onChange={onPasswordChange}
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
        onChange={onUserRoleChange}
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Admin</option>
        <option value="exam_committee">Exam Committee</option>
      </select>
    </div>

    <Button label="Login" type="submit" loading={isLoading} variant="primary" />

    <button
      type="button"
      className="text-blue-600 underline mt-2 text-sm"
      onClick={onForgotPasswordClick}
    >
      Forgot your password?
    </button>
  </form>
);

export default LoginForm;
