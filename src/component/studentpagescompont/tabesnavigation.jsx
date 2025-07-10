import React from "react";
import TabsNavigation from "./components/TabsNavigation";
import TabsNavigation from "./TabsNavigation";
interface TabsNavigationProps {
  activeTab: "profile" | "edit" | "results" | "submit";
  onChangeTab: (tab: "profile" | "edit" | "results" | "submit") => void;
}

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, onChangeTab }) => {
  const tabs = ["profile", "edit", "results", "submit"] as const;

  return (
    <nav className="flex space-x-4 mb-8 border-b">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChangeTab(tab)}
          className={`pb-2 font-semibold text-gray-600 hover:text-blue-700 border-b-2 ${
            activeTab === tab ? "border-blue-700 text-blue-700" : "border-transparent"
          }`}
        >
          {tab === "profile"
            ? "Profile"
            : tab === "edit"
            ? "Edit Profile"
            : tab === "results"
            ? "View Results"
            : "Submit Answer"}
        </button>
      ))}
    </nav>
  );
};

export default TabsNavigation;
