import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  ArrowRight,
  History,
  LineChart,
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react';
import Sidebar from './Sidebar';

/**
 * Alıntıları ve animasyonunu kapsayan ayrı bir bileşen.
 * Burada bilim insanı alıntıları için beş saniyede bir dönen animasyon
 * kendi içinde yönetilir; grafiklerle karışmaz.
 */
const QuotesSection = ({ userName }) => {
  const quotes = [
    {
      quote: "Hayatın en büyük hataları, başarıya ne kadar yaklaştıklarını bilmeyen insanların vazgeçmelerinden dolayı olur.",
      author: "Thomas Edison",
      color: "from-blue-600 to-indigo-600"
    },
    {
      quote: "Çok zeki olduğumdan değil, sorunlarla uğraşmaktan vazgeçmediğimden başarıyorum.",
      author: "Albert Einstein",
      color: "from-purple-600 to-pink-600"
    },
    {
      quote: "İnsanlar konusunda daha az, fikirler konusunda daha çok meraklı olun.",
      author: "Marie Curie",
      color: "from-green-600 to-teal-600"
    },
    {
      quote: "Zafer, zafer benimdir diyebilenindir. Başarı ise 'başaracağım' diye başlayarak sonunda 'başardım' diyenindir.",
      author: "Mustafa Kemal Atatürk",
      color: "from-orange-600 to-red-600"
    },
    {
      quote: "Başarısız olsak bile çabalarımız boşa değildir.",
      author: "Nikola Tesla",
      color: "from-indigo-600 to-purple-600"
    },
    {
      quote: "Deneme kesinliğin anasıdır, bilgi kesinliktir.",
      author: "Leonardo da Vinci",
      color: "from-teal-600 to-blue-600"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hoş Geldiniz, {userName || 'Kullanıcı'}
          </h1>
          <p className="text-gray-600 mt-2">
            Bugün kendinizi geliştirmek için mükemmel bir gün!
          </p>
        </div>
      </div>

      {/* Alıntı kutusu */}
      <div
        className={`bg-gradient-to-r ${quotes[currentQuote].color} rounded-xl p-6 text-white shadow-lg transition-all duration-500 ease-in-out`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-medium mb-2">"{quotes[currentQuote].quote}"</p>
            <p className="text-sm opacity-80">- {quotes[currentQuote].author}</p>
          </div>
          <Award className="w-12 h-12 opacity-20" />
        </div>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceData, setPracticeData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Grafiklerin yalnızca ilk yüklemede animasyon göstermesi için.
  const [animateCharts, setAnimateCharts] = useState(true);

  /**
   * Veri çekme işlemi
   * Sadece bir kez (component mount olduğunda) çağrılır.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        // İki farklı endpoint'e aynı anda istek
        const [practicesResponse, userResponse] = await Promise.all([
          fetch('http://localhost:3000/api/practices?limit=6', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:3000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        if (!practicesResponse.ok || !userResponse.ok) {
          throw new Error('Veri getirme hatası');
        }

        // Practices endpoint'inden duyguAnaliz ve bilgiAnaliz gibi ek parametreler geliyor
        const { practices, duyguAnaliz, bilgiAnaliz } = await practicesResponse.json();
        const userData = await userResponse.json();
        setUserData(userData);

        // Practice verilerini detaylandırıp diziye aktarıyoruz
        const detailedPractices = practices.map(practice => {
          const stressScores = practice.questions.map(q => q.analysisResults?.stress_score || 0);
          const matchScores = practice.questions.map(q => q.analysisResults?.match_bonus || 0);
          const knowledgeScores = practice.questions.map(q => q.bilgiAnalizi?.puan || 0);

          const averageStress = Math.min(
            100,
            Math.round(stressScores.reduce((a, b) => a + b, 0) / (stressScores.length || 1))
          );
          const averageMatch = Math.min(
            100,
            Math.round(matchScores.reduce((a, b) => a + b, 0) / (matchScores.length || 1))
          );
          const averageKnowledge = Math.min(
            100,
            Math.round(knowledgeScores.reduce((a, b) => a + b, 0) / (knowledgeScores.length || 1))
          );

          const generalScore = Math.min(
            100,
            Math.round(
              (averageStress + averageMatch) * (duyguAnaliz / 100) +
              averageKnowledge * (bilgiAnaliz / 100)
            )
          );

          return {
            id: practice._id,
            name: practice.pratikAdi || `Pratik ${practice.questions.length}`,
            stressScore: averageStress,
            matchScore: averageMatch,
            knowledgeScore: averageKnowledge,
            generalScore,
            questionCount: practice.questions.length,
            date: new Date(practice.createdAt).toLocaleDateString('tr-TR'),
            timestamp: new Date(practice.createdAt).getTime()
          };
        });

        setPracticeData(detailedPractices.reverse());
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Veri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  /**
   * Zaman aralığı filtreleme
   */
  const filteredData = useMemo(() => {
    const now = Date.now();
    const filters = {
      day: now - 86400000,        // 1 gün
      week: now - 604800000,      // 1 hafta
      month: now - 2592000000,    // 1 ay
      year: now - 31536000000,    // 1 yıl
      all: 0
    };
    // Önce zaman filtresini uygula
    const timeFiltered = practiceData.filter(item => item.timestamp >= filters[selectedTimeRange]);

    // Sonra seçilen zaman aralığına göre son N pratiği al
    const limits = {
      day: 2,    // Son 2 pratik
      week: 3,   // Son 3 pratik
      month: 4,  // Son 4 pratik
      year: 5,   // Son 5 pratik
      all: 6     // Son 6 pratik
    };

    return timeFiltered.slice(-limits[selectedTimeRange]);
  }, [practiceData, selectedTimeRange]);

  /**
   * Üst kısımdaki zaman aralığı seçici buton grubu
   */
  const TimeRangeSelector = () => (
    <div className="flex space-x-2 mb-6">
      {[
        { key: 'day', label: '2 Pratik' },
        { key: 'week', label: '3 Pratik' },
        { key: 'month', label: '4 Pratik' },
        { key: 'year', label: '5 Pratik' },
        { key: 'all', label: '6 Pratik' }
      ].map(range => (
        <button
          key={range.key}
          onClick={() => setSelectedTimeRange(range.key)}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${selectedTimeRange === range.key
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  /**
   * Küçük BarChart bileşeni
   */
  const SmallChart = ({ data, dataKey, title, color, icon: Icon, animate }) => (
    <div className="w-full bg-white rounded-xl shadow-lg">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Icon className="w-5 h-5 mr-2" style={{ color }} />
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Son {data.length} pratik</p>
            </div>
          </div>
        </div>

        <div className="h-28 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 5, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke="#666"
                fontSize={9}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#666"
                fontSize={9}
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickCount={5}
              />
              <Tooltip
                formatter={(value) => [`${value} puan`, title]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                isAnimationActive={animate}
                animationDuration={1000}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm font-semibold" style={{ color }}>
              {data[data.length - 1]?.[dataKey] || 0} puan
            </p>
            <p className="text-xs text-gray-500">Son Pratik</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {Math.round(
                data.reduce((acc, curr) => acc + curr[dataKey], 0) / (data.length || 1)
              )}{' '}
              puan
            </p>
            <p className="text-xs text-gray-500">Ortalama</p>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * Büyük AreaChart bileşeni
   */
  const LargeChart = ({ data, animate }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Genel Performans Analizi</h2>
          <p className="text-sm text-gray-500">Tüm değerlendirmelerin birleşik sonucu</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setActiveTab('stress')}
            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${activeTab === 'stress'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Stres
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${activeTab === 'knowledge'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Bilgi
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGeneral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorKnowledge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              domain={[0, 100]}
              tickCount={6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [
                `${value} puan`,
                name === 'generalScore'
                  ? 'Genel'
                  : name === 'stressScore'
                    ? 'Stres'
                    : 'Bilgi'
              ]}
              labelFormatter={(label) => `${label} Pratiği`}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) =>
                value === 'generalScore'
                  ? 'Genel Performans'
                  : value === 'stressScore'
                    ? 'Stres Kontrolü'
                    : 'Bilgi Seviyesi'
              }
            />
            {/* "all" sekmesi seçili ise "generalScore" da görünsün */}
            {(activeTab === 'all' || activeTab === 'general') && (
              <Area
                type="monotone"
                dataKey="generalScore"
                stroke="#4F46E5"
                strokeWidth={2}
                fill="url(#colorGeneral)"
                dot={{ r: 4, fill: "#4F46E5" }}
                activeDot={{ r: 6, fill: "#4F46E5" }}
                isAnimationActive={animate}
                animationDuration={1000}
                animationBegin={0}
              />
            )}
            {/* "all" sekmesi veya "stress" sekmesi seçili ise */}
            {(activeTab === 'all' || activeTab === 'stress') && (
              <Area
                type="monotone"
                dataKey="stressScore"
                stroke="#9333EA"
                strokeWidth={2}
                fill="url(#colorStress)"
                dot={{ r: 4, fill: "#9333EA" }}
                activeDot={{ r: 6, fill: "#9333EA" }}
                isAnimationActive={animate}
                animationDuration={1000}
                animationBegin={0}
              />
            )}
            {/* "all" sekmesi veya "knowledge" sekmesi seçili ise */}
            {(activeTab === 'all' || activeTab === 'knowledge') && (
              <Area
                type="monotone"
                dataKey="knowledgeScore"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#colorKnowledge)"
                dot={{ r: 4, fill: "#059669" }}
                activeDot={{ r: 6, fill: "#059669" }}
                isAnimationActive={animate}
                animationDuration={1000}
                animationBegin={0}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Son Pratik</p>
            <LineChart className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold text-indigo-700 mt-1">
            {data[data.length - 1]?.generalScore || 0} puan
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Ortalama</p>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold text-indigo-700 mt-1">
            {data.length
              ? Math.round(data.reduce((acc, curr) => acc + curr.generalScore, 0) / data.length)
              : 0}{' '}
            puan
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">İlerleme</p>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-semibold text-indigo-700 mt-1">
            {data.length > 1
              ? `${data[data.length - 1].generalScore -
                data[data.length - 2].generalScore > 0 ? '+' : ''
              }${data[data.length - 1].generalScore - data[data.length - 2].generalScore} puan`
              : '0 puan'}
          </p>
        </div>
      </div>
    </div>
  );

  /**
   * İki adet aksiyon kartı (yeni pratik + geçmiş pratik)
   */
  const ActionCards = () => (
    <div className="grid grid-cols-2 gap-6 mt-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group">
        <div className="flex h-full">
          <div className="flex-1 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Yeni Mülakat Pratiği
            </h3>
            <p className="text-gray-600 mb-6">
              AI destekli mülakat simülasyonuyla kendinizi geliştirin ve özgüveninizi artırın.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg 
                hover:bg-indigo-700 transition-colors duration-200"
              onClick={() => window.location.href = '/new-practice'}
            >
              <span>Hadi Pratik Yapalım</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500"></div>
          <div
            className="w-24 bg-indigo-50 flex items-center justify-center transition-colors duration-200 
            group-hover:bg-indigo-100"
          >
            <TrendingUp className="h-12 w-12 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden group">
        <div className="flex h-full">
          <div className="flex-1 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Geçmiş Pratikleriniz
            </h3>
            <p className="text-gray-600 mb-6">
              Performansınızı analiz edin ve gelişim alanlarınızı keşfedin.
            </p>
            <button
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg 
                hover:bg-purple-700 transition-colors duration-200"
              onClick={() => window.location.href = '/practice-history'}
            >
              <span>Pratikleri İncele</span>
              <History className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="w-1 bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500"></div>
          <div
            className="w-24 bg-purple-50 flex items-center justify-center transition-colors duration-200 
            group-hover:bg-purple-100"
          >
            <LineChart className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-80 p-8">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            // Yükleniyor durumu
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : error ? (
            // Hata durumu
            <div className="flex items-center justify-center h-screen">
              <div className="text-red-500 text-center">
                <p className="font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Yeniden Dene
                </button>
              </div>
            </div>
          ) : (
            // Normal durum
            <div className="space-y-8">
              {/* Bilim insanı alıntılarının animasyonu ayrı bir bileşende yönetiliyor */}
              <QuotesSection userName={userData?.username} />

              <TimeRangeSelector />

              <div className="grid grid-cols-3 gap-6">
                <SmallChart
                  data={filteredData}
                  dataKey="stressScore"
                  title="Stres Analizi"
                  color="#9333EA"
                  icon={Target}
                  animate={animateCharts}
                />
                <SmallChart
                  data={filteredData}
                  dataKey="matchScore"
                  title="Eşleşme Analizi"
                  color="#2563EB"
                  icon={LineChart}
                  animate={animateCharts}
                />
                <SmallChart
                  data={filteredData}
                  dataKey="knowledgeScore"
                  title="Bilgi Analizi"
                  color="#059669"
                  icon={Zap}
                  animate={animateCharts}
                />
              </div>

              <LargeChart data={filteredData} animate={animateCharts} />

              <ActionCards />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
