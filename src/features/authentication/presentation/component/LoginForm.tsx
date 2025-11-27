import React from "react";
import TextBox from "../../../../core/component/commonTextBox";
import Button from "../../../../core/component/commonButton";

interface LoginFormProps {
  username: string;
  password: string;
  userRole: string;
  onSubmit?: (e: React.FormEvent) => void;
  onForgotPasswordClick?: () => void;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  isLoading,
  onSubmit, // ✅ Use the function passed from LoginPage
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextBox
        label="Username"
        name="username"
        value={username}
        onChange={onUsernameChange}
        placeholder="Enter your username"
      />
      <TextBox
        label="Password"
        name="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Enter your password"
      />
      <Button variant="primary" fullWidth type="submit" isLoading={isLoading}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
