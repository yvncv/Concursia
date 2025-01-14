"use client";
import React, { useState } from "react";
import AdminSideBar from "./adminSideBar/AdminSideBar";
import Users from "./Users";
import Events from "./Events";
import Dashboard from "./Dashboard";

const Page = () => {
  const [activeComponent, setActiveComponent] = useState<string>("Dashboard");

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case "Dashboard":
        return <Dashboard />;
      case "Users":
        return <Users />;
      case "Events":
        return <Events />;
      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSideBar setActiveComponent={setActiveComponent} />

      {/* Main content */}
      <div className="flex-1 p-6 bg-gray-100 overflow-y-auto ml-64">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Page;
