// src/core/component/Role.ts
import { create } from "zustand";

// Add new roles to UserRole type
export type UserRole =
  | "admin"
  | "instructor"
  | "student"
  | "guest"
  | "departmentHead"
  | "examCommittee"
  | "";

interface RoleProps {
  role: UserRole;
  updaterole: (role: UserRole) => void;
  clear: () => void;
}

// Get role from localStorage if available
const storedRole =
  typeof window !== "undefined"
    ? (localStorage.getItem("role") as UserRole | null)
    : null;

const RoleStand = create<RoleProps>((set) => ({
  role: storedRole || "guest", // default to guest if not found
  updaterole: (role) => {
    localStorage.setItem("role", role);
    set({ role });
  },
  clear: () => {
    localStorage.setItem("role", "guest");
    set({ role: "guest" });
  },
}));

export default RoleStand;
