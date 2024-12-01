import React, { useState } from "react";
import { HomeIcon, ChartBarIcon, CogIcon, LogoutIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { name: "Ev", icon: HomeIcon, path: "/" },
    { name: "Pratiklerim", icon: ChartBarIcon, path: "/pratiklerim" },
    { name: "Mülakatlarım", icon: CogIcon, path: "/mulakatlarim" },
    { name: "Pratik Oluştur", icon: ChartBarIcon, path: "/pratik-olustur" },
    { name: "Profil Ayarları", icon: CogIcon, path: "/profil-ayarlari" },
  ];

  return (
    <div
      className={`${
        isExpanded ? "w-72" : "w-20"
      } h-screen bg-sidebar-radial text-gray-300 transition-all duration-300 relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 bg-[#013309] rounded-full p-1 z-10"
      >
        <ChartBarIcon className="w-4 h-4 text-gray-300" />
      </button>

      {/* Header Section */}
      <div className="p-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-white mb-6 text-center">
          {isExpanded ? "TRACK AI" : "TA"}
        </div>
        {/* Profile Section */}
        {isExpanded && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-600 mb-3"></div>
            <h2 className="text-white font-medium mb-1">Samet Çelik</h2>
            <span className="text-xs px-3 py-1 bg-[#000000] rounded-full">
              USER
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="flex items-center px-6 py-3 cursor-pointer group"
            >
              {/* Menü Öğesi Bağlantısı */}
              <Link
                to={item.path}
                className="flex items-center w-full text-gray-300 hover:text-[#32CD32] group"
              >
                {/* İkon */}
                <item.icon
                  className={`w-5 h-5 opacity-75 ${
                    !isExpanded && "mx-auto"
                  } group-hover:text-[#32CD32]`}
                />
                {/* Menü İsmi */}
                {isExpanded && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 w-full px-6">
        <div className="flex items-center py-3 cursor-pointer group">
          <LogoutIcon
            className={`w-5 h-5 opacity-75 ${
              !isExpanded && "mx-auto"
            } group-hover:text-[#32CD32]`}
          />
          {isExpanded && (
            <span className="ml-3 group-hover:text-[#32CD32]">Log out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
