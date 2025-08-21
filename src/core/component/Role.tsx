// src/core/component/Role.ts
import { create } from "zustand";

export type UserRole = "admin" | "instructor" | "student" | "guest" | "";

interface RoleProps {
  role: UserRole;
  updaterole: (role: UserRole) => void;
  clear: () => void;
}

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
