import React, { useState } from "react";

interface UserFormProps {
  onSubmit: (userData: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      staffId: "",
      email: "",
      password: "",
      role: "student",
      division: "",
      isActive: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit(formData);
      if (!isEditing)
        setFormData({
          name: "",
          staffId: "",
          email: "",
          password: "",
          role: "student",
          division: "",
          isActive: true,
        });
    } catch (err: any) {
      setFormError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded bg-gray-50"
    >
      {formError && <div className="col-span-2 text-red-600">{formError}</div>}
      <input
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      />
      <input
        name="staffId"
        placeholder="Staff ID"
        value={formData.staffId}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 rounded"
      />
      <input
        name="password"
        type="password"
        placeholder={isEditing ? "New Password" : "Password"}
        value={formData.password}
        onChange={handleChange}
        required={!isEditing}
        className="border p-2 rounded"
      />
      <input
        name="division"
        placeholder="Division / Department"
        value={formData.division}
        onChange={handleChange}
        className="border p-2 rounded"
      />
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      >
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
        <option value="admin">Admin</option>
        <option value="examCommittee">Exam Committee</option>
        <option value="departmentHead">Department Head</option>
      </select>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label>Active</label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-green-600 text-white py-2 px-4 rounded col-span-2"
      >
        {isEditing ? "Update" : "Add"}
      </button>
      {isEditing && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white py-2 px-4 rounded col-span-2"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default UserForm;
