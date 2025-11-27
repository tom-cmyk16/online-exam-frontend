import React, { useState, useEffect } from "react";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maxLoginAttempts: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireStrongPassword: boolean;
  enable2FA: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  defaultUserRole: string;
  backupFrequency: string;
  logRetentionDays: number;
  maxFileSize: number;
  allowedFileTypes: string[];
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed";
}

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "EduManage System",
    siteDescription: "Educational Management Platform",
    adminEmail: "admin@edumanage.com",
    supportEmail: "support@edumanage.com",
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enable2FA: false,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    maintenanceMode: false,
    allowUserRegistration: true,
    defaultUserRole: "student",
    backupFrequency: "daily",
    logRetentionDays: 90,
    maxFileSize: 10,
    allowedFileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [activeTab, setActiveTab] = useState<
    | "general"
    | "security"
    | "notifications"
    | "maintenance"
    | "backup"
    | "audit"
  >("general");

  // Role options for dropdown
  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "instructor", label: "Instructor" },
    { value: "admin", label: "Admin" },
    { value: "departmentHead", label: "Department Head" },
    { value: "examCommittee", label: "Exam Committee" },
  ];

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:5000/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.warn("Failed to fetch settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.warn("Failed to fetch audit logs:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAuditLogs();
  }, []);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArraySettingChange = (
    key: keyof SystemSettings,
    value: string
  ) => {
    const currentArray = settings[key] as string[];
    const newArray = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setSettings((prev) => ({
      ...prev,
      [key]: newArray,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaveStatus("saving");
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);

        // Log the settings change
        await fetch("http://localhost:5000/api/audit-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "System settings updated",
            user: "Admin",
            ipAddress: "127.0.0.1",
            status: "success",
          }),
        });

        fetchAuditLogs();
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const resetSettings = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all settings to default? This action cannot be undone."
      )
    ) {
      const defaultSettings: SystemSettings = {
        siteName: "EduManage System",
        siteDescription: "Educational Management Platform",
        adminEmail: "admin@edumanage.com",
        supportEmail: "support@edumanage.com",
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        passwordMinLength: 8,
        requireStrongPassword: true,
        enable2FA: false,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        maintenanceMode: false,
        allowUserRegistration: true,
        defaultUserRole: "student",
        backupFrequency: "daily",
        logRetentionDays: 90,
        maxFileSize: 10,
        allowedFileTypes: [".pdf", ".doc", ".docx", ".jpg", ".png"],
      };
      setSettings(defaultSettings);
    }
  };

  const runBackup = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/backup", {
        method: "POST",
      });

      if (res.ok) {
        alert("Backup completed successfully!");
        fetchAuditLogs();
      } else {
        alert("Backup failed!");
      }
    } catch (err) {
      console.error("Backup error:", err);
      alert("Backup failed!");
    }
  };

  const clearLogs = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all audit logs? This action cannot be undone."
      )
    ) {
      try {
        const res = await fetch("http://localhost:5000/api/audit-logs", {
          method: "DELETE",
        });

        if (res.ok) {
          setAuditLogs([]);
          alert("Audit logs cleared successfully!");
        }
      } catch (err) {
        console.error("Error clearing logs:", err);
      }
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "maintenance", label: "Maintenance", icon: "🛠️" },
    { id: "backup", label: "Backup", icon: "💾" },
    { id: "audit", label: "Audit Logs", icon: "📋" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-700">System Settings</h2>
        <div className="flex space-x-3">
          <button
            onClick={resetSettings}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset to Default
          </button>
          <button
            onClick={saveSettings}
            disabled={saveStatus === "saving"}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saveStatus === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {saveStatus === "success" && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {saveStatus === "error" && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          Failed to save settings. Please try again.
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) =>
                  handleSettingChange("siteName", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) =>
                  handleSettingChange("adminEmail", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  handleSettingChange("supportEmail", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default User Role
              </label>
              <select
                value={settings.defaultUserRole}
                onChange={(e) =>
                  handleSettingChange("defaultUserRole", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) =>
                handleSettingChange("siteDescription", e.target.value)
              }
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowUserRegistration"
              checked={settings.allowUserRegistration}
              onChange={(e) =>
                handleSettingChange("allowUserRegistration", e.target.checked)
              }
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
            <label
              htmlFor="allowUserRegistration"
              className="ml-2 text-sm text-gray-700"
            >
              Allow new user registration
            </label>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  handleSettingChange(
                    "maxLoginAttempts",
                    parseInt(e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleSettingChange(
                    "sessionTimeout",
                    parseInt(e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings.passwordMinLength}
                onChange={(e) =>
                  handleSettingChange(
                    "passwordMinLength",
                    parseInt(e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.maxFileSize}
                onChange={(e) =>
                  handleSettingChange("maxFileSize", parseInt(e.target.value))
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types (comma-separated)
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes.join(", ")}
              onChange={(e) =>
                handleArraySettingChange("allowedFileTypes", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder=".pdf, .doc, .jpg, .png"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireStrongPassword"
                checked={settings.requireStrongPassword}
                onChange={(e) =>
                  handleSettingChange("requireStrongPassword", e.target.checked)
                }
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label
                htmlFor="requireStrongPassword"
                className="ml-2 text-sm text-gray-700"
              >
                Require strong passwords (uppercase, lowercase, numbers, special
                characters)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable2FA"
                checked={settings.enable2FA}
                onChange={(e) =>
                  handleSettingChange("enable2FA", e.target.checked)
                }
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="enable2FA" className="ml-2 text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-500">
                  Receive important updates via email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) =>
                  handleSettingChange(
                    "enableEmailNotifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-500">
                  Receive urgent alerts via SMS
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSMSNotifications}
                onChange={(e) =>
                  handleSettingChange(
                    "enableSMSNotifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Settings */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">⚠️</div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Maintenance Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    When enabled, the system will be unavailable to regular
                    users. Only administrators will be able to access the
                    system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                Enable Maintenance Mode
              </h4>
              <p className="text-sm text-gray-500">
                Restrict access to administrators only
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                handleSettingChange("maintenanceMode", e.target.checked)
              }
              className="h-4 w-4 text-green-600 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Retention Period (days)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={settings.logRetentionDays}
              onChange={(e) =>
                handleSettingChange(
                  "logRetentionDays",
                  parseInt(e.target.value)
                )
              }
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === "backup" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) =>
                  handleSettingChange("backupFrequency", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Backup
              </label>
              <input
                type="text"
                value="2024-01-15 14:30:00"
                disabled
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={runBackup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Run Backup Now
            </button>
            <button
              onClick={() =>
                alert("Download functionality would be implemented here")
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Download Latest Backup
            </button>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              System Audit Logs
            </h3>
            <button
              onClick={clearLogs}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Clear All Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">IP Address</th>
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">{log.user}</td>
                    <td className="px-4 py-2">{log.ipAddress}</td>
                    <td className="px-4 py-2">{log.timestamp}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsPage;
