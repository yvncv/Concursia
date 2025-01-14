import React from "react";

interface AdminSideBarProps {
  setActiveComponent: (component: string) => void;
}

const AdminSideBar: React.FC<AdminSideBarProps> = ({ setActiveComponent }) => {
  return (
    <div className="fixed h-full w-64 bg-gray-800 text-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setActiveComponent("Dashboard")}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveComponent("Users")}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Users
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveComponent("Events")}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-700 transition"
              >
                Events
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSideBar;
