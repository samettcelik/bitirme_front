import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  FilePenIcon,
  MessagesSquareIcon
} from 'lucide-react';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Menü öğeleri
  const menuItems = [
    {
      name: "Ev",
      icon: HomeIcon,
      path: "/"
    },
    {
      name: "Pratiklerim",
      icon: ChartBarIcon,
      path: "/pratiklerim"
    },
    {
      name: "Mülakatlarım",
      icon: MessagesSquareIcon,
      path: "/mulakatlarim"
    },
    {
      name: "Pratik Oluştur",
      icon: FilePenIcon,
      path: "/pratik-olustur"
    },
    {
      name: "Profil Ayarları",
      icon: CogIcon,
      path: "/profil-ayarlari"
    }
  ];

  // Kullanıcı verilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData(response.data);
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className={`
        fixed left-8 top-8 bottom-8
        ${isExpanded ? 'w-72' : 'w-20'}
        bg-gradient-to-b from-purple-700 to-purple-900
        rounded-3xl
        transition-all duration-300
        shadow-xl
        flex flex-col
        text-white
        z-50
      `}
    >
      {/* Genişlet/Daralt Butonu */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="w-4 h-4 text-purple-700" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-purple-700" />
        )}
      </button>

      {/* Başlık ve Kullanıcı Bilgileri */}
      <div className="p-6">
        <div className="text-2xl font-bold mb-6 text-center">
          {isExpanded ? "TRACK AI" : "TA"}
        </div>

        {isExpanded && userData && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white/20 mb-3 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white/60" />
            </div>
            <h2 className="font-medium mb-1">{userData.username || 'Kullanıcı'}</h2>
            <span className="text-xs px-3 py-1 bg-purple-500/50 rounded-full">
              USER
            </span>
          </div>
        )}
      </div>

      {/* Ana Menü */}
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

      {/* Çıkış Butonu */}
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
          <LogOutIcon 
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

export default Sidebar;