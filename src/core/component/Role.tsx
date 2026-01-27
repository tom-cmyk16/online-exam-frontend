// src/core/component/Role.ts
import { create } from "zustand";

<<<<<<< HEAD
// Add new roles to UserRole type
export type UserRole =
  | "admin"
  | "instructor"
  | "student"
  | "guest"
  | "departmentHead"
  | "examCommittee"
  | "";
=======
export type UserRole = "admin" | "instructor" | "student" | "guest" | "";
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42

interface RoleProps {
  role: UserRole;
  updaterole: (role: UserRole) => void;
  clear: () => void;
}

<<<<<<< HEAD
// Get role from localStorage if available
=======
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
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
