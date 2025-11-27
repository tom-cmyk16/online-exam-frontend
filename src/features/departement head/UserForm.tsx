import React, { useState, useEffect } from "react";
import axios from "axios";

interface User {
  _id?: string;
  fullName: string;
  username: string;
  email: string;
  password?: string;
  role: "student" | "instructor" | "admin" | "departmentHead" | "examCommittee";
  department: string;
  year?: string;
  programType?: string;
  section?: string;
  isActive: boolean;
}

interface UserFormProps {
  initialData?: Partial<User>;
  isEditing?: boolean;
  onSubmit: (data: Partial<User>) => Promise<void>;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    year: "",
    programType: "regular",
    section: "",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, password: "" });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        role: "student",
        department: "",
        year: "",
        programType: "regular",
        section: "",
        isActive: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg"
    >
      <input
        name="fullName"
        value={formData.fullName || ""}
        onChange={handleChange}
        placeholder="Full Name"
        required
        className="p-2 border rounded"
      />
      <input
        name="username"
        value={formData.username || ""}
        onChange={handleChange}
        placeholder="Username"
        required
        className="p-2 border rounded"
      />
      <input
        name="email"
        value={formData.email || ""}
        onChange={handleChange}
        placeholder="Email"
        type="email"
        required
        className="p-2 border rounded"
      />
      {!isEditing && (
        <input
          name="password"
          value={formData.password || ""}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
          className="p-2 border rounded"
        />
      )}
      <input
        name="department"
        value={formData.department || ""}
        onChange={handleChange}
        placeholder="Department"
        className="p-2 border rounded"
      />
      <select
        name="year"
        value={formData.year || ""}
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="">Select Year</option>
        <option value="1">Year 1</option>
        <option value="2">Year 2</option>
        <option value="3">Year 3</option>
        <option value="4">Year 4</option>
        <option value="5">Year 5</option>
      </select>
      <select
        name="programType"
        value={formData.programType || "regular"}
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="regular">Regular</option>
        <option value="extension">Extension</option>
        <option value="summer">Summer</option>
      </select>
      <input
        name="section"
        value={formData.section || ""}
        onChange={handleChange}
        placeholder="Section"
        className="p-2 border rounded"
      />
      <div className="flex items-center space-x-2 p-2 border rounded bg-white">
        <input
          name="isActive"
          type="checkbox"
          checked={!!formData.isActive}
          onChange={handleCheckbox}
        />
        <label>Active User</label>
      </div>
      <div className="md:col-span-3 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          {submitting ? "..." : isEditing ? "Update Student" : "Add Student"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default UserForm;
