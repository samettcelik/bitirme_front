import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Activity, Brain, Clock, ChevronDown, ChevronUp, MessageSquare,
  Target, LineChart as LineChartIcon, Zap, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const API_BASE_URL = 'http://localhost:3000/api';

const EMOTION_COLORS = {
  "Surprise": "#FFD700",
  "Happiness": "#32CD32",
  "Sadness": "#4169E1",
  "Fear": "#9932CC",
  "Anger": "#FF4500",
  "Neutral": "#808080"
};

const SCORE_COLORS = {
  general: "#4F46E5",
  stress: "#9333EA",
  match: "#2563EB",
  knowledge: "#059669"
};

// Circular Progress Chart Component
const CircularChart = ({ value, title, subtitle, color, icon: Icon }) => {
  const data = [{ value: value }, { value: 100 - value }];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" style={{ color }} />
        <div>
          <div className="text-gray-900 font-semibold">{title}</div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative w-28 h-28">
          <PieChart width={112} height={112}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill="#E5E7EB" />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>
              {value}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Emotion Distribution Chart Component
const EmotionDistributionChart = ({ emotionData, type }) => {
  const calculateEmotionDistribution = (data, analysisType) => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    const CHUNK_SIZE = 10;
    const distributionData = [];

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, Math.min(i + CHUNK_SIZE, data.length));
      
      const emotions = chunk.map(item => {
        const emotionsArray = analysisType === 'face' ? item.faceEmotions : item.audioEmotions;
        if (!Array.isArray(emotionsArray)) return [];
        
        return emotionsArray
          .map(e => {
            const emotion = e?.emotion;
            return emotion ? emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase() : null;
          })
          .filter(e => e !== null && EMOTION_COLORS.hasOwnProperty(e));
      }).flat();

      if (emotions.length === 0) continue;

      const emotionCounts = {};
      Object.keys(EMOTION_COLORS).forEach(emotion => {
        emotionCounts[emotion] = 0;
      });

      emotions.forEach(emotion => {
        if (emotion) emotionCounts[emotion]++;
      });

      const total = emotions.length;
      const groupData = {
        name: `${Math.floor(i/CHUNK_SIZE) + 1}. Grup`
      };

      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        groupData[emotion] = (count / total) * 100;
      });

      distributionData.push(groupData);
    }

    return distributionData;
  };

  const data = calculateEmotionDistribution(emotionData, type);
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="font-semibold mb-4">
        {type === 'face' ? 'Yüz İfadesi Duygu Dağılımı' : 'Ses Duygu Dağılımı'}
      </h4>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              stroke="#666"
              label={{ 
                value: 'Duygu Yoğunluğu (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold mb-2">{label}</p>
                      {payload
                        .sort((a, b) => b.value - a.value)
                        .map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">
                              {entry.name}: {entry.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
            />
            {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
              <Line
                key={emotion}
                type="monotone"
                dataKey={emotion}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PratikDetay = () => {
  const { id } = useParams();
  const [pratik, setPratik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    const fetchPratikDetay = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/practices/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Pratik detayları getirilemedi');
        const data = await response.json();
        setPratik(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPratikDetay();
  }, [id]);

  const calculateQuestionScores = (question) => {
    const results = question.analysisResults || {};
    const knowledgeScore = question.bilgiAnalizi?.puan || 0;
    const stressScore = results.stress_score || 0;
    const matchScore = results.match_bonus || 0;

    const duyguAnaliz = pratik?.duyguAnaliz || 50;
    const bilgiAnaliz = pratik?.bilgiAnaliz || 50;

    const emotionScore = stressScore + matchScore;
    const generalScore = Math.min(
      100,
      Math.round(
        (emotionScore * (duyguAnaliz / 100)) +
        (knowledgeScore * (bilgiAnaliz / 100))
      )
    );

    return {
      stressScore,
      matchScore,
      knowledgeScore,
      generalScore
    };
  };

  const calculatePratikScores = () => {
    if (!pratik?.questions?.length) return null;

    const scores = pratik.questions.map(calculateQuestionScores);
    
    return {
      stressScore: Math.min(
        100,
        Math.round(scores.reduce((sum, s) => sum + s.stressScore, 0) / scores.length)
      ),
      matchScore: Math.min(
        100,
        Math.round(scores.reduce((sum, s) => sum + s.matchScore, 0) / scores.length)
      ),
      knowledgeScore: Math.min(
        100,
        Math.round(scores.reduce((sum, s) => sum + s.knowledgeScore, 0) / scores.length)
      ),
      generalScore: Math.min(
        100,
        Math.round(scores.reduce((sum, s) => sum + s.generalScore, 0) / scores.length)
      )
    };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="ml-32 flex-1 p-8 transition-all duration-300">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-32 flex-1 p-8 transition-all duration-300">
        <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg m-8">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!pratik) return null;

  const scores = calculatePratikScores();

  return (
    <div className="ml-32 flex-1 p-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
                {pratik.pratikAdi}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{formatDate(pratik.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Score Cards */}
          {scores && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
              <CircularChart
                value={scores.generalScore}
                title="Genel Skor"
                subtitle="Tüm değerlendirmelerin ortalaması"
                color={SCORE_COLORS.general}
                icon={Activity}
              />
              <CircularChart
                value={scores.stressScore}
                title="Stres Kontrolü"
                subtitle="Duygusal denge puanı"
                color={SCORE_COLORS.stress}
                icon={Target}
              />
              <CircularChart
                value={scores.matchScore}
                title="Eşleşme Puanı"
                subtitle="Beklenen yanıtlarla uyum"
                color={SCORE_COLORS.match}
                icon={LineChartIcon}
              />
              <CircularChart
                value={scores.knowledgeScore}
                title="Bilgi Seviyesi"
                subtitle="Teknik yeterlilik puanı"
                color={SCORE_COLORS.knowledge}
                icon={Zap}
              />
            </div>
          )}

          {/* Questions Section */}
          <div className="p-6">
            <div className="space-y-6">
              {pratik.questions.map((question, index) => {
                const questionScores = calculateQuestionScores(question);
                
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-semibold">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900">{question.text}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-600">
                          Genel Skor: {questionScores.generalScore}%
                        </span>
                        {expandedQuestion === index ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>

                    {expandedQuestion === index && (
                      <div className="border-t border-gray-200">
                        {/* Question Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                          <CircularChart
                            value={questionScores.generalScore}
                            title="Genel Skor"
                            subtitle="Toplam performans"
                            color={SCORE_COLORS.general}
                            icon={Activity}
                          />
                          <CircularChart
                            value={questionScores.stressScore}
                            title="Stres Kontrolü"
                            subtitle="Duygusal denge"
                            color={SCORE_COLORS.stress}
                            icon={Target}
                          />
                          <CircularChart
                            value={questionScores.matchScore}
                            title="Eşleşme"
                            subtitle="Yanıt uygunluğu"
                            color={SCORE_COLORS.match}
                            icon={LineChartIcon}
                          />
                          <CircularChart
                            value={questionScores.knowledgeScore}
                            title="Bilgi"
                            subtitle="Teknik yeterlilik"
                            color={SCORE_COLORS.knowledge}
                            icon={Zap}
                          />
                        </div>

                        {/* Knowledge Analysis */}
                        {question.bilgiAnalizi && (
                          <div className="p-6 border-t border-gray-200">
                            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-600" />
                              Bilgi Analizi Raporu
                            </h4>
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <div className="prose prose-purple max-w-none">
                                <div className="whitespace-pre-wrap">
                                  {question.bilgiAnalizi.rapor}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Emotion Analysis */}
                        {question.emotionData && question.emotionData.length > 0 && (
                          <div className="space-y-6 p-6 border-t border-gray-200">
                            {/* Voice Emotions Chart */}
                            <EmotionDistributionChart 
                              emotionData={question.emotionData} 
                              type="audio"
                            />

                            {/* Speech Text */}
                            {question.emotionData[question.emotionData.length - 1]?.speechText && (
                              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6">
                                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                    Konuşma Metni
                                  </h4>
                                  <div className="bg-gray-50 p-6 rounded-lg">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                      {question.emotionData[question.emotionData.length - 1].speechText}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Analysis Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Duygusal Denge</div>
                                <div className="mt-1 flex items-end gap-1">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {questionScores.stressScore}%
                                  </div>
                                  <div className="text-sm text-gray-500 mb-1">stres kontrolü</div>
                                </div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Yanıt Uygunluğu</div>
                                <div className="mt-1 flex items-end gap-1">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {questionScores.matchScore}%
                                  </div>
                                  <div className="text-sm text-gray-500 mb-1">eşleşme oranı</div>
                                </div>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Bilgi Seviyesi</div>
                                <div className="mt-1 flex items-end gap-1">
                                  <div className="text-2xl font-bold text-emerald-600">
                                    {questionScores.knowledgeScore}%
                                  </div>
                                  <div className="text-sm text-gray-500 mb-1">teknik analiz</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PratikDetay;