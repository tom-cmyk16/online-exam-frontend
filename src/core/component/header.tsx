import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="text-gray-500">🔔</span>
          </button>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              JD
            </div>
            <span className="ml-2 text-sm font-medium">John Doe</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
