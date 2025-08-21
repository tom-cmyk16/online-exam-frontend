import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  username: string;
  role: "admin" | "instructor" | "student";
  email?: string;
  photo?: string;
}

interface AuthContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

// Optional: Default to an empty user (can redirect to login)
const defaultUser: User = {
  username: "",
  role: "student", // Or "admin" or "instructor" — pick one default if needed
};

export const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(defaultUser);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
