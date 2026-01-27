import React from 'react';

interface TestCredentialsProps {
  onCredentialSelect: (username: string, password: string) => void;
}

const TestCredentials: React.FC<TestCredentialsProps> = ({ onCredentialSelect }) => {
  const testAccounts = [
    {
      role: 'Admin',
      username: 'admin',
      password: 'admin123',
      description: 'Full system access'
    },
    {
      role: 'Admin',
      username: 'wawuu',
      password: '222222',
      description: 'Alternative admin account'
    },
    {
      role: 'Student',
      username: 'Alexo',
      password: '777777',
      description: 'Take exams and view results'
    }
  ];

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">🧪 Test Credentials</h3>
      <div className="space-y-2">
        {testAccounts.map((account, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{account.role}</div>
              <div className="text-xs text-gray-600">{account.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-mono">{account.username}</span> / <span className="font-mono">{account.password}</span>
              </div>
            </div>
            <button
              onClick={() => onCredentialSelect(account.username, account.password)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Use
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-blue-600">
        💡 Click "Use" to auto-fill credentials, or create your own account in the backend
      </div>
    </div>
  );
};

export default TestCredentials;