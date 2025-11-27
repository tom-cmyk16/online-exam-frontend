// features/instructor/context/InstructorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface InstructorContextType {
  instructorName: string;
  setInstructorName: React.Dispatch<React.SetStateAction<string>>;
}

const InstructorContext = createContext<InstructorContextType | undefined>(
  undefined
);

export const InstructorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [instructorName, setInstructorName] = useState("Instructor");

  return (
    <InstructorContext.Provider value={{ instructorName, setInstructorName }}>
      {children}
    </InstructorContext.Provider>
  );
};

export const useInstructor = () => {
  const context = useContext(InstructorContext);
  if (!context)
    throw new Error("useInstructor must be used within InstructorProvider");
  return context;
};
