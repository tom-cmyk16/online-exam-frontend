import React from "react";
import TextBox from "../../../../core/component/commonTextBox";
import Button from "../../../../core/component/commonButton";

interface LoginFormProps {
  username: string;
  password: string;
  userRole: string;
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
      <TextBox
        label="Username"
        name="username"
        value={username}
        onChange={onUsernameChange}
        placeholder="Enter your username"
      />
    </div>
    <div>
      <TextBox
        label="Password"
        name="password"
        value={password}
        onChange={onPasswordChange}
        placeholder="Enter your password"
      />
    </div>

    <Button variant="primary" fullWidth onClick={() => console.log("Clicked!")}>
      Login
    </Button>
    <button
      type="button"
      className="text-blue-600 underline mt-2 text-sm cursor-pointer"
      onClick={onForgotPasswordClick}
    >
      Forgot your password?
    </button>
  </form>
);

export default LoginForm;
