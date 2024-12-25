// CompanyInterviews.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, FileSpreadsheet, Users, Calendar } from 'lucide-react';

const CompanyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.get('/api/interviews/company/all-interview-results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const interviewsWithDetails = await Promise.all((response.data.interviews || []).map(async (interview) => {
          try {
            let totalEmotion = 0;
            let totalTechnical = 0;
            let totalFinal = 0;
            let participantCount = 0;

            for (const participant of interview.results || []) {
              const detailResponse = await axios.get(
                `/api/interviews/interview-detail/${interview.id}/${participant.email}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const scores = detailResponse.data.participant.overallScores || {};
              totalEmotion += scores.totalEmotionScore || 0;
              totalTechnical += scores.totalKnowledgeScore || 0;
              totalFinal += scores.finalScore || 0;
              participantCount++;
            }

            const count = Math.max(participantCount, 1);
            return {
              ...interview,
              scores: {
                emotion: totalEmotion / count,
                technical: totalTechnical / count,
                final: totalFinal / count
              }
            };
          } catch (err) {
            console.error('Error fetching interview details:', err);
            return {
              ...interview,
              scores: { emotion: 0, technical: 0, final: 0 }
            };
          }
        }));

        setInterviews(interviewsWithDetails);
        setLoading(false);
      } catch (error) {
        setError('Mülakatlar yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const filteredInterviews = interviews.filter(interview =>
    interview.mulakatAdi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mülakatlar</h1>
        <p className="text-gray-600 mt-2">Tüm mülakat listesi ve detayları</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Mülakat ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-700 font-medium">
            Toplam {interviews.length} mülakat
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterviews.map((interview) => (
          <Link
            key={interview.id}
            to={`/company-interviews/${interview.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-gray-800">{interview.mulakatAdi}</h3>
                <span className="text-sm text-gray-500">#{interview.id.slice(-6)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{interview.results?.length || 0} Katılımcı</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(interview.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-xs text-gray-500">Duygu</div>
                <div className="font-medium text-blue-600">{interview.scores.emotion.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Teknik</div>
                <div className="font-medium text-green-600">{interview.scores.technical.toFixed(1)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Final</div>
                <div className="font-medium text-purple-600">{interview.scores.final.toFixed(1)}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Detayları Görüntüle →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FileSpreadsheet className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Mülakat Bulunamadı</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Arama kriterlerine uygun mülakat bulunamadı.' : 'Henüz mülakat oluşturulmamış.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyInterviews;