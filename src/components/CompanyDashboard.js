import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const Dashboard = ({ isSidebarExpanded }) => {
  const [interviews, setInterviews] = useState([]);
  const [participantDetails, setParticipantDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartDateOrder, setChartDateOrder] = useState('desc');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(6);
  const [summaryDateOrder, setSummaryDateOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const interviewsPerPage = 10;

  const calculateScores = (responses, totalQuestions) => {
    const defaultScore = { emotionScore: 0, knowledgeScore: 0 };
    if (!Array.isArray(responses) || responses.length === 0) return defaultScore;

    try {
      let totalEmotionScore = 0;
      let totalKnowledgeScore = 0;
      let answeredQuestions = responses.length;

      responses.forEach(response => {
        if (response?.emotionAnalysis?.generalScore !== undefined) {
          totalEmotionScore += Number(response.emotionAnalysis.generalScore);
        }
        if (response?.knowledgeAnalysis?.totalScore !== undefined) {
          totalKnowledgeScore += Number(response.knowledgeAnalysis.totalScore);
        }
      });

      const emotionScore = answeredQuestions > 0 ? (totalEmotionScore / answeredQuestions) * (answeredQuestions / totalQuestions) : 0;
      const knowledgeScore = answeredQuestions > 0 ? (totalKnowledgeScore / answeredQuestions) * (answeredQuestions / totalQuestions) : 0;

      const finalScore = (emotionScore * 0.3) + (knowledgeScore * 0.7);

      return {
        emotionScore,
        knowledgeScore,
        finalScore
      };
    } catch (error) {
      console.error('Error calculating scores:', error);
      return defaultScore;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const interviewsResponse = await axios.get('/api/interviews/company/all-interview-results', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const interviewsData = interviewsResponse.data.interviews || [];
        setInterviews(interviewsData);

        const details = {};
        for (const interview of interviewsData) {
          for (const participant of interview.results || []) {
            try {
              const detailResponse = await axios.get(
                `/api/interviews/interview-detail/${interview.id}/${participant.email}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              const totalQuestions = interview.totalQuestions || 2;
              const scores = calculateScores(detailResponse.data?.participant?.responses, totalQuestions);
              
              details[`${interview.id}-${participant.email}`] = {
                ...scores,
                responses: detailResponse.data.participant.responses,
                name: participant.name || participant.email.split('@')[0]
              };
            } catch (err) {
              console.error('Error fetching participant details:', err);
            }
          }
        }
        setParticipantDetails(details);
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processedData = React.useMemo(() => {
    return interviews.map(interview => {
      const participants = interview.results || [];
      const interviewScores = participants.map(participant => {
        const details = participantDetails[`${interview.id}-${participant.email}`] || {};
        return {
          emotionScore: details.emotionScore || 0,
          knowledgeScore: details.knowledgeScore || 0,
          finalScore: details.finalScore || 0
        };
      });

      const avgScores = interviewScores.reduce((acc, curr) => ({
        emotionScore: acc.emotionScore + curr.emotionScore,
        knowledgeScore: acc.knowledgeScore + curr.knowledgeScore,
        finalScore: acc.finalScore + curr.finalScore
      }), { emotionScore: 0, knowledgeScore: 0, finalScore: 0 });

      const participantCount = participants.length || 1;

      return {
        name: interview.mulakatAdi || 'İsimsiz Mülakat',
        id: interview.id,
        date: new Date(interview.createdAt),
        stresSkoru: avgScores.emotionScore / participantCount,
        teknikSkoru: avgScores.knowledgeScore / participantCount,
        finalSkor: avgScores.finalScore / participantCount,
        katilimciSayisi: participantCount
      };
    });
  }, [interviews, participantDetails]);

  // Rest of the component remains the same
  const sortData = (data, dateOrder) => {
    return [...data].sort((a, b) => 
      dateOrder === 'desc' ? b.date - a.date : a.date - b.date
    );
  };

  const sortAndLimitData = (data, filter, count, dateOrder) => {
    let sorted = sortData(data, dateOrder);
    if (filter !== 'all') {
      sorted = sorted.sort((a, b) => 
        filter === 'highest' ? b.finalSkor - a.finalSkor : a.finalSkor - b.finalSkor
      );
    }
    return sorted.slice(0, count);
  };

  const filteredChartData = React.useMemo(() => 
    sortAndLimitData(processedData, scoreFilter, displayCount, chartDateOrder),
    [processedData, scoreFilter, displayCount, chartDateOrder]
  );

  const filteredSummaryData = React.useMemo(() => 
    sortData(processedData, summaryDateOrder),
    [processedData, summaryDateOrder]
  );

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * interviewsPerPage;
    return filteredSummaryData.slice(startIndex, startIndex + interviewsPerPage);
  }, [filteredSummaryData, currentPage]);

  const totalPages = Math.ceil(filteredSummaryData.length / interviewsPerPage);

  const calculateAverages = () => {
    const selectedInterviews = filteredChartData;
    let totalScores = { emotion: 0, technical: 0, final: 0 };
    let count = selectedInterviews.length;

    selectedInterviews.forEach(interview => {
      totalScores.emotion += interview.stresSkoru || 0;
      totalScores.technical += interview.teknikSkoru || 0;
      totalScores.final += interview.finalSkor || 0;
    });

    return {
      emotion: count ? (totalScores.emotion / count).toFixed(1) : "0.0",
      technical: count ? (totalScores.technical / count).toFixed(1) : "0.0",
      final: count ? (totalScores.final / count).toFixed(1) : "0.0"
    };
  };

  const averages = calculateAverages();

  if (loading) {
    return (
      <div className="ml-96 p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-96 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ml-96 p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-96 p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-96 p-8">
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <select
            value={chartDateOrder}
            onChange={(e) => setChartDateOrder(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Yeniden Eskiye</option>
            <option value="asc">Eskiden Yeniye</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500" />
        </div>
        
        <div className="relative">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tüm Sonuçlar</option>
            <option value="highest">En Yüksek Skorlar</option>
            <option value="lowest">En Düşük Skorlar</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={processedData.length}
            value={displayCount}
            onChange={(e) => setDisplayCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), processedData.length))}
            className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">Mülakat</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Stres Skoru</h3>
          <p className="text-2xl font-bold text-blue-600">{averages.emotion}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Teknik Skor</h3>
          <p className="text-2xl font-bold text-green-600">{averages.technical}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Final Skor</h3>
          <p className="text-2xl font-bold text-purple-600">{averages.final}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-base font-semibold mb-3">Skor Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} height={60} angle={-45} textAnchor="end"/>
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="stresSkoru" name="Stres Skoru" fill="#3B82F6" />
                <Bar dataKey="teknikSkoru" name="Teknik Skor" fill="#10B981" />
                <Bar dataKey="finalSkor" name="Final Skor" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-base font-semibold mb-3">Katılımcı Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 12}} height={60} angle={-45} textAnchor="end"/>
                <YAxis tick={{fontSize: 12}} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Line 
                  type="monotone" 
                  dataKey="katilimciSayisi" 
                  name="Katılımcı Sayısı"
                  stroke="#6366F1" 
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Mülakat Özeti</h3>
          <div className="relative">
            <select
              value={summaryDateOrder}
              onChange={(e) => setSummaryDateOrder(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Yeniden Eskiye</option>
              <option value="asc">Eskiden Yeniye</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm">Mülakat Adı</th>
                <th className="text-center py-2 px-4 text-sm">Tarih</th>
                <th className="text-center py-2 px-4 text-sm">Katılımcı</th>
                <th className="text-center py-2 px-4 text-sm">Ort. Stres</th>
                <th className="text-center py-2 px-4 text-sm">Ort. Teknik</th>
                <th className="text-center py-2 px-4 text-sm">Ort. Final</th>
              </tr>
            </thead>
            <tbody>
            {paginatedData.map((interview, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4 text-sm">{interview.name}</td>
                  <td className="text-center py-2 px-4 text-sm">
                    {interview.date.toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="text-center py-2 px-4 text-sm">{interview.katilimciSayisi}</td>
                  <td className="text-center py-2 px-4 text-sm">{interview.stresSkoru.toFixed(1)}</td>
                  <td className="text-center py-2 px-4 text-sm">{interview.teknikSkoru.toFixed(1)}</td>
                  <td className="text-center py-2 px-4 text-sm">{interview.finalSkor.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-gray-500">
            Toplam {filteredSummaryData.length} mülakatın {(currentPage - 1) * interviewsPerPage + 1} - {Math.min(currentPage * interviewsPerPage, filteredSummaryData.length)} arası gösteriliyor
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-1 text-sm">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 text-sm rounded-lg flex items-center justify-center transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;