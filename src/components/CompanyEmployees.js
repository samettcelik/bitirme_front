import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowUpDown } from 'lucide-react';

const InterviewResults = () => {
  const [interviews, setInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [participantDetails, setParticipantDetails] = useState({});
  const navigate = useNavigate();

  const formatScore = (score) => {
    return typeof score === 'number' ? score.toFixed(1) : '0.0';
  };

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

      return {
        emotionScore: emotionScore,
        knowledgeScore: knowledgeScore
      };
    } catch (error) {
      console.error('Error calculating scores:', error);
      return defaultScore;
    }
  };

  const calculateFinalScore = (scores) => {
    const emotionWeight = 0.3; // 30%
    const knowledgeWeight = 0.7; // 70%
    
    return (scores.emotionScore * emotionWeight) + (scores.knowledgeScore * knowledgeWeight);
  };

  const calculateAverageScores = (participants) => {
    if (!Array.isArray(participants) || participants.length === 0) {
      return { avgEmotion: 0, avgKnowledge: 0 };
    }

    try {
      const totalEmotion = participants.reduce((sum, p) => sum + (Number(p.emotionScore) || 0), 0);
      const totalKnowledge = participants.reduce((sum, p) => sum + (Number(p.knowledgeScore) || 0), 0);

      return {
        avgEmotion: totalEmotion / participants.length,
        avgKnowledge: totalKnowledge / participants.length
      };
    } catch (error) {
      console.error('Error calculating averages:', error);
      return { avgEmotion: 0, avgKnowledge: 0 };
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.get('/api/interviews/company/all-interview-results', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const details = {};
        for (const interview of response.data.interviews || []) {
          for (const participant of interview.results || []) {
            try {
              const detailResponse = await axios.get(
                `/api/interviews/interview-detail/${interview.id}/${participant.email}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              const totalQuestions = interview.totalQuestions || 2;
              const scores = calculateScores(detailResponse.data?.participant?.responses, totalQuestions);
              const finalScore = calculateFinalScore(scores);

              details[`${interview.id}-${participant.email}`] = {
                ...scores,
                finalScore
              };
              
            } catch (err) {
              console.error('Error fetching participant details:', err);
              details[`${interview.id}-${participant.email}`] = {
                finalScore: 0,
                emotionScore: 0,
                knowledgeScore: 0
              };
            }
          }
        }
        
        setInterviews(response.data.interviews || []);
        setParticipantDetails(details);
      } catch (err) {
        setError('Sonuçlar yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredParticipants = React.useMemo(() => {
    if (!Array.isArray(interviews)) return [];
    
    const participants = interviews.flatMap(interview => {
      if (!Array.isArray(interview?.results)) return [];
      
      return interview.results
        .filter(participant => {
          if (!participant) return false;
          
          const searchLower = searchTerm.toLowerCase();
          const firstName = (participant.firstName || '').toLowerCase();
          const lastName = (participant.lastName || '').toLowerCase();
          const email = (participant.email || '').toLowerCase();
          
          return firstName.includes(searchLower) ||
                 lastName.includes(searchLower) ||
                 email.includes(searchLower);
        })
        .map(participant => ({
          ...participant,
          interviewName: interview.mulakatAdi || 'İsimsiz Mülakat',
          interviewId: interview.id,
          ...participantDetails[`${interview.id}-${participant.email}`]
        }));
    });

    return participants.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName || ''} ${a.lastName || ''}`.localeCompare(
            `${b.firstName || ''} ${b.lastName || ''}`
          );
        case 'scoreAsc':
          return (Number(a.finalScore) || 0) - (Number(b.finalScore) || 0);
        case 'scoreDesc':
          return (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0);
        default:
          return 0;
      }
    });
  }, [interviews, searchTerm, sortBy, participantDetails]);

  const averageScores = calculateAverageScores(filteredParticipants);

  if (loading) {
    return (
      <div className="ml-96 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-96 p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-96 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">
                {filteredParticipants.length}
              </div>
              <div className="text-sm text-gray-600">Toplam Katılımcı</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">
                {formatScore(averageScores.avgEmotion)}
              </div>
              <div className="text-sm text-gray-600">Ortalama Duygusal Skor</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {formatScore(averageScores.avgKnowledge)}
              </div>
              <div className="text-sm text-gray-600">Ortalama Teknik Skor</div>
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="İsim veya email ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                sortBy === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              İsme Göre
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'scoreAsc' ? 'scoreDesc' : 'scoreAsc')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                sortBy.startsWith('score') ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 mr-2" />
              Puana Göre {sortBy === 'scoreAsc' ? '(Artan)' : '(Azalan)'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredParticipants.map((participant) => (
            <div 
              key={`${participant.interviewId}-${participant.email}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">
                      {participant.firstName} {participant.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mülakat: {participant.interviewName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Duygusal: {formatScore(participant.emotionScore)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Teknik: {formatScore(participant.knowledgeScore)}
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        Final: {formatScore(participant.finalScore)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/company-employees/interview-detail/${participant.interviewId}/${participant.email}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Detaylar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredParticipants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Arama kriterlerine uygun sonuç bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResults;