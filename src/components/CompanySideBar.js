import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building,
  UserPlus,
  ClipboardList
} from 'lucide-react';

const CompanySideBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/company-dashboard"
    },
    {
      name: "Şirket Profili",
      icon: Building2,
      path: "/company-profile"
    },
    {
      name: "Çalışanlar",
      icon: Users,
      path: "/company-employees"
    },
    {
      name: "Mülakat Oluştur",
      icon: UserPlus,
      path: "/mulakat-olustur"
    },
    {
      name: "Mülakatlar",
      icon: FileSpreadsheet,
      path: "/company-interviews"
    },
    {
      name: "Mülakat Raporları",
      icon: ClipboardList,
      path: "/interview-reports"
    },
    {
      name: "Ayarlar",
      icon: Settings,
      path: "/company-settings"
    }
  ];

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        if (!token) {
          navigate('/company-login');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/company/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCompanyData(response.data);
      } catch (error) {
        console.error('Şirket bilgileri alınamadı:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('companyToken');
          navigate('/company-login');
        }
      }
    };

    fetchCompanyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('companyToken');
    navigate('/company-login');
  };

  return (
    <div
      className={`
        fixed left-8 top-8 bottom-8
        ${isExpanded ? 'w-72' : 'w-20'}
        bg-gradient-to-b from-blue-700 to-blue-900
        rounded-3xl
        transition-all duration-300
        shadow-xl
        flex flex-col
        text-white
        z-50
      `}
    >
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-blue-700" />
        ) : (
          <ChevronRight className="w-4 h-4 text-blue-700" />
        )}
      </button>

      {/* Company Header */}
      <div className="p-6">
        <div className="text-2xl font-bold mb-6 text-center">
          {isExpanded ? "COMPANY PANEL" : "CP"}
        </div>

        {isExpanded && companyData && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 mb-3 flex items-center justify-center">
              <Building className="w-8 h-8 text-white/60" />
            </div>
            <h2 className="font-medium mb-1">{companyData.name || 'Company Name'}</h2>
            <span className="text-xs px-3 py-1 bg-blue-500/50 rounded-full">
              COMPANY
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`
                  flex items-center
                  px-4 py-3
                  rounded-xl
                  hover:bg-white/10
                  transition-colors
                  group
                  ${window.location.pathname === item.path ? 'bg-white/10' : ''}
                `}
              >
                <item.icon 
                  className={`
                    w-5 h-5
                    ${!isExpanded && 'mx-auto'}
                    group-hover:scale-110
                    transition-transform
                  `}
                />
                {isExpanded && (
                  <span className="ml-3 text-sm">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="
            flex items-center
            w-full px-4 py-3
            rounded-xl
            hover:bg-white/10
            transition-colors
            group
          "
        >
          <LogOut 
            className={`
              w-5 h-5
              ${!isExpanded && 'mx-auto'}
              group-hover:scale-110
              transition-transform
            `}
          />
          {isExpanded && <span className="ml-3 text-sm">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
};

export default CompanySideBar;