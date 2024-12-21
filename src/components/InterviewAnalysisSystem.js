// src/pages/InterviewAnalysisSystem.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Video, MessageSquare, BarChart2, Activity, Square, Clock } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const API_URL = 'http://localhost:3000/api';
const BASE_URL = 'http://localhost:5000';

// LoadingSpinner Component
const LoadingSpinner = () => (
  <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

// Timer Component
const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-blue-700">
      <Clock className="w-4 h-4" />
      <span className="font-mono text-sm font-medium">{formatTime(elapsed)}</span>
    </div>
  );
};

const VideoStream = ({ videoRef }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    let retry;
    const startVideoStream = () => {
      if (videoRef.current) {
        const videoUrl = `${BASE_URL}/video_feed?timestamp=${Date.now()}`;
        videoRef.current.src = videoUrl;
        videoRef.current.onerror = () => {
          setError(true);
          retry = setTimeout(startVideoStream, 2000);
        };
        videoRef.current.onload = () => setError(false);
      }
    };

    startVideoStream();
    return () => {
      if (retry) clearTimeout(retry);
      if (videoRef.current) videoRef.current.src = '';
    };
  }, [videoRef]);

  return (
    <>
      <img
        ref={videoRef}
        alt="Video analizi"
        className="w-full h-full object-contain rounded-xl"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-xl">
          <p className="text-white">Video bağlantısı yeniden kuruluyor...</p>
        </div>
      )}
    </>
  );
};

const InterviewAnalysisSystem = () => {
  const { uniqueUrl } = useParams();
  const videoRef = useRef(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);

  // Analysis states
  const [analysisStates, setAnalysisStates] = useState({});
  const [currentEmotions, setCurrentEmotions] = useState({ face: [], audio: [] });
  const [speechText, setSpeechText] = useState('');
  const [completedRounds, setCompletedRounds] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);

  // Registration form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await axios.get(`${API_URL}/interviews/${uniqueUrl}`);
        setInterview(response.data);
        const initialStates = {};
        response.data.questions.forEach((_, index) => {
          initialStates[index] = {
            active: false,
            complete: false,
            results: null
          };
        });
        setAnalysisStates(initialStates);
        setLoading(false);
      } catch (err) {
        setError('Mülakat yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchInterview();
  }, [uniqueUrl]);

  useEffect(() => {
    let statusInterval;
    const currentAnalysisState = analysisStates[currentQuestion];

    if (currentAnalysisState?.active && !currentAnalysisState?.complete) {
      statusInterval = setInterval(async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/analysis_status`);
          if (!response.ok) throw new Error('Status fetch failed');

          const data = await response.json();
          
          setCurrentEmotions({
            face: data.face_emotions || [],
            audio: data.audio_emotions || []
          });

          if (data.analysis_info) {
            setCompletedRounds(data.analysis_info.completed_rounds || 0);
            setTotalAnalyses(data.analysis_info.total_analyses || 0);

            if (data.analysis_info.results && !currentAnalysisState.complete) {
              setAnalysisStates(prev => ({
                ...prev,
                [currentQuestion]: {
                  ...prev[currentQuestion],
                  results: data.analysis_info.results,
                  complete: !data.active && !data.speech_active
                }
              }));
            }
          }

          const speechResponse = await fetch(`${BASE_URL}/api/speech_text`);
          if (speechResponse.ok) {
            const speechData = await speechResponse.json();
            if (speechData.text) {
              setSpeechText(speechData.text);
            }
          }
        } catch (error) {
          console.error('Analysis status fetch error:', error);
        }
      }, 1000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [currentQuestion, analysisStates]);

  const handleStartAnalysis = async () => {
    const question = interview?.questions[currentQuestion];
    try {
      setShowQuestion(true);
      setAnalysisStartTime(Date.now());
      setAnalysisStates(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          active: true,
          complete: false,
          results: null
        }
      }));

      const response = await fetch(`${BASE_URL}/api/start_analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question._id,
          questionNumber: currentQuestion + 1,
          questionText: question.text
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setError('Analiz başlatılamadı');
      
      setShowQuestion(false);
      setAnalysisStartTime(null);
      setAnalysisStates(prev => ({
        ...prev,
        [currentQuestion]: {
          ...prev[currentQuestion],
          active: false,
          complete: false,
          results: null
        }
      }));
    }
  };

  const handleNextQuestion = async () => {
    const currentState = analysisStates[currentQuestion];
    if (!currentState?.complete) {
      setError('Lütfen önce mevcut analizi tamamlayın');
      return;
    }

    const isLastQuestion = currentQuestion === (interview?.questions?.length || 0) - 1;

    setLoadingNextQuestion(true);
    try {
      const question = interview.questions[currentQuestion];
      const stopRes = await fetch(`${BASE_URL}/api/stop_analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question._id,
          questionText: question.text,
          userId: formData.email,
          isLastQuestion
        })
      });

      if (!stopRes.ok) {
        throw new Error('Analizi durdurmada hata oluştu');
      }

      const stopData = await stopRes.json();

      if(!stopData.emotion_analysis) {
        throw new Error('stop_analysis yanıtında emotion_analysis eksik');
      }
      
      // KnowledgeAnalysis verisi var mı kontrol et
      let knowledgeAnalysis = {
        evaluation_text: '',
        total_score: 0,
        report_text: ''
      };
      if (stopData.evaluation) {
        knowledgeAnalysis = {
          evaluation_text: stopData.evaluation.evaluation_text || '',
          total_score: stopData.evaluation.total_score || 0,
          report_text: stopData.evaluation.report_text || ''
        };
      }

      // speechText zaten state içinde mevcut (speechText)
      const responseData = {
        email: formData.email,
        questionId: question._id,
        questionNumber: currentQuestion + 1,
        questionText: question.text,
        speechToText: speechText || 'Metin bulunamadı',
        emotionAnalysis: stopData.emotion_analysis,
        knowledgeAnalysis: knowledgeAnalysis
      };

      const saveRes = await fetch(`${API_URL}/interviews/${uniqueUrl}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData)
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error('Cevaplar veritabanına kaydedilemedi: ' + errData.message);
      }

      await saveRes.json();

      if (!isLastQuestion) {
        setCurrentQuestion(prev => prev + 1);
        setShowQuestion(false);
        setCurrentEmotions({ face: [], audio: [] });
        setSpeechText('');
        setAnalysisStartTime(null);
      } else {
        // Son soru da bitti
        setError('Tüm sorular tamamlandı. Mülakat sonlandı.');
      }

    } catch (error) {
      console.error('Failed to process next question:', error);
      setError('Analiz durdurulurken bir hata oluştu veya sonuçlar kaydedilemedi. Detay: ' + error.message);
    } finally {
      setLoadingNextQuestion(false);
    }
  };

  const renderQuestionContent = () => {
    const question = interview?.questions[currentQuestion];
    const currentAnalysisState = analysisStates[currentQuestion];
    const isLastQuestion = currentQuestion === (interview?.questions?.length || 0) - 1;
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {showQuestion && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 rounded-xl font-bold">
                    Soru {currentQuestion + 1}
                  </div>
                  <h2 className="text-xl font-semibold">{question?.text}</h2>
                </div>
                {analysisStartTime && <Timer startTime={analysisStartTime} />}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Yüz Analizi</h3>
            </div>
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
              <VideoStream videoRef={videoRef} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            {!currentAnalysisState?.active ? (
              <button
                onClick={handleStartAnalysis}
                className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Analizi Başlat
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!currentAnalysisState?.complete || loadingNextQuestion}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  currentAnalysisState?.complete && !loadingNextQuestion
                    ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {!currentAnalysisState?.complete ? (
                  <>
                    <LoadingSpinner />
                    Analiz Devam Ediyor...
                  </>
                ) : loadingNextQuestion ? (
                  <>
                    <LoadingSpinner />
                    Değerlendirme Raporu Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5" />
                    {isLastQuestion ? "Analiz Bitti - Mülakatı Bitir" : "Analiz Bitti - Sonraki Soruya Geç"}
                  </>
                )}
              </button>
            )}
          </div>

          {currentAnalysisState?.active && (
            <>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="w-4 h-4" />
                    <span>Döngü: {completedRounds}/14</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <BarChart2 className="w-4 h-4" />
                    <span>Analiz: {totalAnalyses}/84</span>
                  </div>
                </div>
              </div>

              {currentEmotions.face.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Mevcut Duygular
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="font-medium text-blue-900">
                        Ses: {currentEmotions.audio.map(e =>
                          `${e.emotion} (${(e.score * 100).toFixed(1)}%)`
                        ).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {speechText && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Konuşma Metni
                  </h3>
                  <div className="max-h-48 overflow-y-auto p-4 bg-blue-50 rounded-xl">
                    <pre className="whitespace-pre-wrap text-sm text-blue-900">
                      {speechText}
                    </pre>
                  </div>
                </div>
              )}

              {currentAnalysisState?.complete && currentAnalysisState?.results && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    Analiz Sonuçları
                  </h3>
                  <BarChart 
                    width={500} 
                    height={200} 
                    data={[
                      { name: 'Stres Skoru', value: currentAnalysisState.results.stress_score },
                      { name: 'Eşleşme Bonusu', value: currentAnalysisState.results.match_bonus },
                      { name: 'Genel Skor', value: currentAnalysisState.results.general_score }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </div>
              )}
            </>
          )}
        </div>

        {currentAnalysisState?.active && (
          <>
            {!currentAnalysisState.complete ? (
              <div className="fixed bottom-6 right-6">
                <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-blue-100">
                  <LoadingSpinner />
                  <span className="text-sm font-medium text-blue-700">
                    Analiz devam ediyor...
                  </span>
                </div>
              </div>
            ) : (
              <div className="fixed top-20 right-6">
                <div className="bg-green-50 rounded-xl shadow-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm font-medium text-green-700">
                      {loadingNextQuestion 
                        ? 'Değerlendirme raporu hazırlanıyor...'
                        : 'Analiz tamamlandı - sonraki soruya geçebilirsiniz'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-50 rounded-xl shadow-lg p-4 border border-red-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-sm font-medium text-red-700">
                  {error}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-6 left-6">
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-blue-100">
            <span className="text-sm font-medium text-gray-600">
              Soru {currentQuestion + 1} / {interview?.questions?.length || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/interviews/${uniqueUrl}/register`, {
        ...formData,
        interviewId: interview._id
      });
      setIsRegistered(true);
    } catch (err) {
      setError('Kayıt işlemi başarısız oldu');
    }
  };

  const renderRegistrationForm = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{interview?.mulakatAdi}</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Mülakat Kaydı</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ad
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Soyad
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Kayıt Ol ve Mülakata Başla
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-blue-400 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-blue-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-blue-400 rounded"></div>
              <div className="h-4 bg-blue-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Hata! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isRegistered ? renderRegistrationForm() : renderQuestionContent()}
    </div>
  );
};

export default InterviewAnalysisSystem;
