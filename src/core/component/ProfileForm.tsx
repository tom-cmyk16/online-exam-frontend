import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Add: npm install framer-motion
import {
  X, User, Mail, Building, Shield, Edit3, Save, Eye, EyeOff,
  Lock, CheckCircle, AlertCircle, Camera, Trash2, Loader2
} from "lucide-react";

interface ProfileFormProps {
  onClose: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profilePhoto, setProfilePhoto] = useState<string>(localStorage.getItem("profilePhoto") || "");
  const [photoPreview, setPhotoPreview] = useState<string>(profilePhoto);

  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    username: localStorage.getItem("username") || "",
    role: localStorage.getItem("role") || "",
    department: localStorage.getItem("department") || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Calculate Password Strength
  const getPasswordStrength = () => {
    const pwd = passwordData.newPassword;
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length > 6) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const getFormattedRole = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      student: "Student",
      instructor: "Instructor",
      admin: "Administrator",
      departmentHead: "Department Head",
      examCommittee: "Exam Committee",
    };
    return roleMap[role] || role;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("❌ Max 2MB");
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    // Simulating API call for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    localStorage.setItem("email", formData.email);
    localStorage.setItem("username", formData.username);
    if (photoPreview) localStorage.setItem("profilePhoto", photoPreview);
    
    setIsSubmitting(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gray-50/50 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-5 h-5 text-green-600" />
            </div>
            Profile
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isEditing && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </motion.button>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-gray-200 text-gray-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {!showChangePassword ? (
          <motion.div layout>
            {/* Avatar Section */}
            <div className="flex flex-col items-center py-4">
              <div className="relative group cursor-pointer">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl relative"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-3xl font-bold text-white">
                      {formData.fullName.charAt(0)}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </motion.div>

                {isEditing && (
                  <input
                    type="file"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                )}
              </div>
              <h3 className="mt-4 font-bold text-gray-800 text-lg">{formData.fullName}</h3>
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                {getFormattedRole(formData.role)}
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {[
                { label: "Username", name: "username", icon: User, editable: true },
                { label: "Email Address", name: "email", icon: Mail, editable: true },
                { label: "Department", name: "department", icon: Building, editable: false },
              ].map((field) => (
                <div key={field.name} className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 flex items-center gap-2 mb-1">
                    <field.icon className="w-3 h-3" />
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      disabled={!isEditing || !field.editable}
                      className={`w-full p-3.5 rounded-xl border-2 transition-all outline-none
                        ${isEditing && field.editable 
                          ? 'border-blue-100 focus:border-blue-500 bg-white' 
                          : 'border-transparent bg-gray-50 text-gray-500 cursor-not-allowed'}`}
                    />
                    {!field.editable && isEditing && (
                       <Lock className="w-4 h-4 text-gray-300 absolute right-4 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Password Toggle Button */}
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full mt-6 py-4 px-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Security & Password
            </button>
          </motion.div>
        ) : (
          /* Change Password Form */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setShowChangePassword(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <h3 className="font-bold text-gray-800 text-lg">Update Password</h3>
            </div>

            {/* Password Inputs */}
            <div className="space-y-4">
               {['currentPassword', 'newPassword', 'confirmPassword'].map((id) => (
                 <div key={id} className="relative">
                    <input
                      type="password"
                      placeholder={id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all"
                      value={passwordData[id as keyof typeof passwordData]}
                      onChange={(e) => setPasswordData({...passwordData, [id]: e.target.value})}
                    />
                 </div>
               ))}
            </div>

            {/* Strength Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Password Strength</span>
                <span>{['Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength() - 1] || 'None'}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className={`h-full flex-1 transition-all duration-500 ${
                      getPasswordStrength() >= step 
                      ? (getPasswordStrength() <= 2 ? 'bg-orange-400' : 'bg-green-500') 
                      : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => {}} // Your handlePasswordSubmit
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Confirm Changes
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-4 bg-gray-50/80 text-center">
         <p className="text-[10px] text-gray-400 uppercase tracking-[2px] font-bold">Secure Profile Management v2.0</p>
      </div>

      {/* Global Success Toast Overlay */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-6 left-6 right-6 bg-green-600 text-white p-4 rounded-xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Profile updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileForm;