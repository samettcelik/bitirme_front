import React from 'react';
import CompanySidebar from './CompanySideBar';
import { BarChart2, Users, Clock, Calendar } from 'lucide-react';

const CompanyDashboard = () => {
  // Örnek veriler
  const stats = [
    {
      title: 'Toplam Mülakat',
      value: '24',
      icon: BarChart2,
      color: 'from-purple-600 to-blue-600'
    },
    {
      title: 'Aktif Adaylar',
      value: '12',
      icon: Users,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      title: 'Bugünkü Mülakatlar',
      value: '3',
      icon: Clock,
      color: 'from-green-600 to-teal-600'
    },
    {
      title: 'Bu Ayki Mülakatlar',
      value: '18',
      icon: Calendar,
      color: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanySidebar />
      
      <div className="flex-1 ml-80 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Başlık */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Hoş Geldiniz, Şirket Paneli
            </h1>
            <p className="mt-2 text-gray-600">
              Mülakat ve aday performans istatistikleriniz aşağıda listelenmiştir.
            </p>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ana İçerik */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Günlük Mülakatlar</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Frontend Developer</p>
                    <p className="text-sm text-gray-600">14:00 - Ahmet Yılmaz</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                    Bekliyor
                  </span>
                </div>
                {/* Diğer mülakatlar buraya eklenebilir */}
              </div>
            </div>

            {/* Sağ Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Son Değerlendirmeler</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Backend Developer</p>
                    <p className="text-sm text-gray-600">85/100 Puan</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    Tamamlandı
                  </span>
                </div>
                {/* Diğer değerlendirmeler buraya eklenebilir */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;