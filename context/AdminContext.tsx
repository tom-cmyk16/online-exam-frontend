// features/admin/context/AdminContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
  adminName: string;
  setAdminName: React.Dispatch<React.SetStateAction<string>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [adminName, setAdminName] = useState("Admin");

  return (
    <AdminContext.Provider value={{ adminName, setAdminName }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
};
