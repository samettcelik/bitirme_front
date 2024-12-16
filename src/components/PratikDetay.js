import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Brain, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:3000/api';

const EMOTION_COLORS = {
  "Surprise": "#FFD700",
  "Happiness": "#32CD32",
  "Sadness": "#4169E1",
  "Fear": "#9932CC",
  "Anger": "#FF4500",
  "Neutral": "#808080"
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const normalizeEmotion = (emotion) => {
    if (!emotion) return null;
    const normalizedEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();
    return EMOTION_COLORS.hasOwnProperty(normalizedEmotion) ? normalizedEmotion : null;
  };

  const calculateEmotionDistribution = (emotionData, type) => {
    if (!emotionData || !Array.isArray(emotionData) || emotionData.length === 0) return [];
    
    const CHUNK_SIZE = 10;
    const distributionData = [];

    for (let i = 0; i < emotionData.length; i += CHUNK_SIZE) {
      const chunk = emotionData.slice(i, Math.min(i + CHUNK_SIZE, emotionData.length));
      
      const emotions = chunk.map(data => {
        const emotionsArray = type === 'face' ? data.faceEmotions : data.audioEmotions;
        if (!Array.isArray(emotionsArray)) return [];
        
        return emotionsArray
          .map(e => normalizeEmotion(e?.emotion))
          .filter(e => e !== null);
      }).flat();

      if (emotions.length === 0) continue;

      const emotionCounts = {};
      Object.keys(EMOTION_COLORS).forEach(emotion => {
        emotionCounts[emotion] = 0;
      });

      emotions.forEach(emotion => {
        if (emotion && emotionCounts.hasOwnProperty(emotion)) {
          emotionCounts[emotion]++;
        }
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

  const CustomTooltip = ({ active, payload, label }) => {
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
  };

  const renderEmotionDistributionChart = (emotionData, type) => {
    const data = calculateEmotionDistribution(emotionData, type);
    if (!data || data.length === 0) return null;

    const chartTitle = type === 'face' ? 'Yüz İfadesi Duygu Dağılımı' : 'Ses Duygu Dağılımı';

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-4">{chartTitle}</h4>
        <div className="h-80 w-full">
          <ResponsiveContainer>
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
                  value: 'Duygu Dağılımı (%)', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fontSize: 12 
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
              {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
                <Line
                  key={emotion}
                  type="monotone"
                  dataKey={emotion}
                  name={emotion}
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

  const renderLastSpeechText = (emotionData) => {
    if (!emotionData || !Array.isArray(emotionData) || emotionData.length === 0) return null;

    // Get the last entry with speech text
    const lastEntry = emotionData[emotionData.length - 1];
    if (!lastEntry.speechText) return null;

    return (
      <div className="mt-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Konuşma Metni
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {formatDate(lastEntry.timestamp)}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{lastEntry.speechText}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  if (!pratik) return null;

  return (
    <div className="ml-96 mr-8 my-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
            {pratik.pratikAdi}
          </h1>
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">{formatDate(pratik.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Duygu Analizi</h2>
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {pratik.duyguAnaliz || 0}%
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Bilgi Analizi</h2>
            </div>
            <div className="text-3xl font-bold text-purple-700">
              {pratik.bilgiAnaliz || 0}%
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {pratik.questions.map((question, index) => (
            <div key={index} className="border rounded-lg">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{question.text}</h3>
                </div>
                {expandedQuestion === index ? <ChevronUp /> : <ChevronDown />}
              </div>

              {expandedQuestion === index && (
                <div className="p-4 border-t space-y-6">
                  {question.bilgiAnalizi && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Bilgi Analizi Raporu</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-2">
                          <span className="font-semibold">Puan: </span>
                          {question.bilgiAnalizi.puan}/100
                        </div>
                        <div className="whitespace-pre-wrap">
                          {question.bilgiAnalizi.rapor}
                        </div>
                      </div>
                    </div>
                  )}

                  {question.emotionData && question.emotionData.length > 0 && (
                    <div className="space-y-8">
                      {renderEmotionDistributionChart(question.emotionData, 'face')}
                      {renderEmotionDistributionChart(question.emotionData, 'audio')}
                      {renderLastSpeechText(question.emotionData)}
                    </div>
                  )}

                  {question.analysisResults && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Analiz Sonuçları</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Stres Skoru</div>
                          <div className="text-xl font-bold">
                            {question.analysisResults.stress_score || 0}%
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Eşleşme Bonusu</div>
                          <div className="text-xl font-bold">
                            {question.analysisResults.match_bonus || 0}%
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Genel Skor</div>
                          <div className="text-xl font-bold">
                            {question.analysisResults.general_score || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PratikDetay;