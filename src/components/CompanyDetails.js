import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CompanyDetails = () => {
  const { id } = useParams();
  const [interviewData, setInterviewData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const calculateScores = (responses, totalQuestions) => {
    if (!Array.isArray(responses) || responses.length === 0) {
      return { emotionScore: 0, knowledgeScore: 0, finalScore: 0 };
    }

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
    
    // Apply 30% emotional and 70% technical weights
    const finalScore = (emotionScore * 0.3) + (knowledgeScore * 0.7);

    return {
      emotionScore,
      knowledgeScore,
      finalScore
    };
  };

  useEffect(() => {
    const fetchInterviewDetails = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.get(`/api/interviews/company/all-interview-results`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const interview = response.data.interviews.find(i => i.id === id);
        if (!interview) throw new Error('Mülakat bulunamadı');
        setInterviewData(interview);

        const participantDetails = [];
        for (const participant of interview.results || []) {
          try {
            const detailResponse = await axios.get(
              `/api/interviews/interview-detail/${id}/${participant.email}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const totalQuestions = interview.totalQuestions || 2;
            const scores = calculateScores(detailResponse.data.participant.responses, totalQuestions);
            
            participantDetails.push({
              name: participant.name || participant.email.split('@')[0],
              email: participant.email,
              totalEmotionScore: scores.emotionScore,
              totalKnowledgeScore: scores.knowledgeScore,
              finalScore: scores.finalScore
            });
          } catch (err) {
            console.error('Error fetching participant details:', err);
          }
        }
        
        setParticipants(participantDetails);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchInterviewDetails();
  }, [id]);

  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.finalScore - a.finalScore;
    }
    return a.finalScore - b.finalScore;
  });

  const calculateAverages = () => {
    if (participants.length === 0) return { emotion: 0, technical: 0, final: 0 };
    return {
      emotion: participants.reduce((acc, p) => acc + p.totalEmotionScore, 0) / participants.length,
      technical: participants.reduce((acc, p) => acc + p.totalKnowledgeScore, 0) / participants.length,
      final: participants.reduce((acc, p) => acc + p.finalScore, 0) / participants.length
    };
  };

  const averages = calculateAverages();

  const chartData = participants.map(p => ({
    name: p.name,
    duygu: p.totalEmotionScore,
    teknik: p.totalKnowledgeScore,
    final: p.finalScore
  }));

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
        <Link 
          to="/company-interviews" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Mülakatlara Dön
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{interviewData?.mulakatAdi}</h1>
        <p className="text-gray-600 mt-2">Mülakat katılımcı detayları</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Duygu Skoru</h3>
          <p className="text-2xl font-bold text-blue-600">{averages.emotion.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Teknik Skor</h3>
          <p className="text-2xl font-bold text-green-600">{averages.technical.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ortalama Final Skor</h3>
          <p className="text-2xl font-bold text-purple-600">{averages.final.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Katılımcı Skor Dağılımı</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 12}}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{fontSize: '12px'}} />
              <Line 
                type="monotone" 
                dataKey="duygu" 
                name="Duygu Skoru"
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{r: 4}}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="teknik" 
                name="Teknik Skor"
                stroke="#10B981" 
                strokeWidth={2}
                dot={{r: 4}}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="final" 
                name="Final Skor"
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{r: 4}}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Katılımcı Skorları</h2>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Yüksek → Düşük</option>
                <option value="asc">Düşük → Yüksek</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İsim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duygu Skoru
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teknik Skor
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Skor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedParticipants.map((participant, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{participant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-blue-600 font-medium">{participant.totalEmotionScore.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-green-600 font-medium">{participant.totalKnowledgeScore.toFixed(1)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm text-purple-600 font-medium">{participant.finalScore.toFixed(1)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {participants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz katılımcı bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;