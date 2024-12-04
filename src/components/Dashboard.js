import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Logout fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-gray-100 flex-1 p-6">
      {/* Header with Welcome and Logout */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş Geldin, Samet!
          </h1>
          <p className="text-sm text-gray-600">
            TRACK AI ile birlikte yeni pratikler yapmaya hazır mısın?
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-colors duration-300"
        >
          Çıkış Yap
        </button>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* İlk Kart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900">TVL 2022</h2>
          <p className="text-2xl font-bold text-gray-800 mt-2">$43,35B</p>
          <p className="text-green-500 text-sm mt-1">+13%</p>
          <div className="mt-6 h-20 bg-gray-700 rounded"></div>
        </div>

        {/* İkinci Kart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900">Change (24h)</h2>
          <p className="text-2xl font-bold text-gray-800 mt-2">-4.31%</p>
          <p className="text-gray-600 text-sm mt-1">-0.07% this month</p>
        </div>

        {/* Üçüncü Kart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900">Maker Dominance</h2>
          <p className="text-2xl font-bold text-gray-800 mt-2">15.62%</p>
          <p className="text-gray-600 text-sm mt-1">+1.31% this month</p>
        </div>
      </div>

      {/* Alt Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bugün Pratik Yaptın mı Kartı */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bugün pratik yaptın mı?
          </h2>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/pratik-olustur")}
              className="px-8 py-4 text-white text-xl font-bold rounded-full bg-gradient-to-r from-black via-[#32CD32] to-black hover:from-black hover:via-red-600 hover:to-black transition-all duration-300"
            >
              Hadi Pratik Yapalım
            </button>
          </div>
        </div>

        {/* Son Yaptığım Pratikler Kartı */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center">
          <p className="text-lg font-medium text-gray-700">Son Yaptığım Pratikler</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;