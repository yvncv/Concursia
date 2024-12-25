import React from "react";

type TabsProps = {
  activeTab: "informacion" | "inscripcion";
  onTabClick: (tab: "informacion" | "inscripcion") => void;
};

const Tabs = ({ activeTab, onTabClick }: TabsProps) => {
  return (
    <div className="text-xl flex justify-center mt-6">
      <button
        className={`px-6 py-2 rounded-tl-lg w-full ${activeTab === "informacion" ? "border-b border-red-600 text-red-600" : ""}`}
        onClick={() => onTabClick("informacion")}
      >
        Información
      </button>
      <button
        className={`px-6 py-2 rounded-tr-lg w-full ${activeTab === "inscripcion" ? "border-b border-red-600 text-red-600" : ""}`}
        onClick={() => onTabClick("inscripcion")}
      >
        Inscripción
      </button>
    </div>
  );
};

export default Tabs;
