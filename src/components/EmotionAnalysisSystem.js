import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Play, Video, MessageSquare, BarChart2, Activity, Square 
} from 'lucide-react';

const BASE_URL = 'http://localhost:5000';

// LoadingSpinner component remains the same
const LoadingSpinner = () => (
  <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

// VideoStream component remains the same
const VideoStream = () => {
  const videoRef = useRef(null);
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
  }, []);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-sm">
      <img
        ref={videoRef}
        alt="Video analizi"
        className="absolute inset-0 w-full h-full object-contain"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <p className="text-white">Video bağlantısı yeniden kuruluyor...</p>
        </div>
      )}
    </div>
  );
};

export default function EmotionAnalysisSystem() {
  // Core States
  const [analysisActive, setAnalysisActive] = useState(false);
  const [currentEmotions, setCurrentEmotions] = useState({ face: [], audio: [] });
  const [speechText, setSpeechText] = useState('');
  const [speechActive, setSpeechActive] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [navigating, setNavigating] = useState(false);

  // Database tracking states
  const [storedEmotions, setStoredEmotions] = useState([]);
  const lastEmotionRef = useRef(null);
  const emotionHistoryRef = useRef([]);
  const analysisResultsRef = useRef(null);

  const navigate = useNavigate();
  const { questionNumber } = useParams();
  const token = localStorage.getItem('token');

  // Fetch stored analysis results
  const fetchStoredResults = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/latest-practice/emotion-data/${questionNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stored results');

      const data = await response.json();
      if (data.analysisResults) {
        setAnalysisResults(data.analysisResults);
        analysisResultsRef.current = data.analysisResults;
      }
    } catch (error) {
      console.error('Error fetching stored results:', error);
    }
  };

  // Store data to database
  const storeData = async (emotionData, analysisData = null) => {
    try {
      const payload = {
        faceEmotions: emotionData.face,
        audioEmotions: emotionData.audio,
        speechText,
        analysisResults: analysisData || analysisResultsRef.current,
        totalAnalyses,
        matchCount: analysisResults?.match_count || 0,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(
        `http://localhost:3000/api/latest-practice/emotion-data/${questionNumber}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error('Failed to store data');

      const result = await response.json();
      console.log('Stored data successfully:', result);

    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  // Effect for tracking analysis status and storing data
  useEffect(() => {
    let statusInterval;
    let speechInterval;

    if (analysisActive && !analysisComplete) {
      statusInterval = setInterval(async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/analysis_status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) throw new Error('Status fetch failed');

          const data = await response.json();

          // Update emotions and store data
          setCurrentEmotions(prevEmotions => {
            const facesChanged = JSON.stringify(prevEmotions.face) !== JSON.stringify(data.face_emotions);
            const audioChanged = JSON.stringify(prevEmotions.audio) !== JSON.stringify(data.audio_emotions);

            if (facesChanged || audioChanged) {
              const newEmotions = {
                face: data.face_emotions,
                audio: data.audio_emotions
              };

              if (data.analysis_info?.results) {
                const newResults = {
                  stress_score: data.analysis_info.results.stress_score || 0,
                  match_bonus: data.analysis_info.results.match_bonus || 0,
                  general_score: data.analysis_info.results.general_score || 0,
                  total_analyses: data.analysis_info.results.total_analyses || 0,
                  match_count: data.analysis_info.results.match_count || 0
                };

                setAnalysisResults(newResults);
                analysisResultsRef.current = newResults;
                storeData(newEmotions, newResults);
              } else {
                storeData(newEmotions);
              }

              return newEmotions;
            }
            return prevEmotions;
          });

          // Update analysis info
          if (data.analysis_info) {
            setCompletedRounds(data.analysis_info.completed_rounds || 0);
            setTotalAnalyses(data.analysis_info.total_analyses || 0);

            if (data.analysis_info.results) {
              setAnalysisResults({
                stress_score: data.analysis_info.results.stress_score || 0,
                match_bonus: data.analysis_info.results.match_bonus || 0,
                general_score: data.analysis_info.results.general_score || 0,
                total_analyses: data.analysis_info.results.total_analyses || 0,
                match_count: data.analysis_info.results.match_count || 0
              });
            }
          }

          // Check if analysis is complete
          if (!data.active && !data.speech_active) {
            setAnalysisComplete(true);
            const finalResponse = await fetch(`${BASE_URL}/api/analysis_status`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (finalResponse.ok) {
              const finalData = await finalResponse.json();
              if (finalData.analysis_info?.results) {
                const finalResults = finalData.analysis_info.results;
                setAnalysisResults(finalResults);
                storeData(currentEmotions, finalResults);
              }
            }
          }
        } catch (error) {
          console.error('Analysis status fetch error:', error);
        }
      }, 1000);

      // Speech text interval
      speechInterval = setInterval(async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/speech_text`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) throw new Error('Speech text fetch failed');

          const data = await response.json();
          if (data.text) {
            setSpeechText(prevText => {
              if (prevText !== data.text) {
                storeData(currentEmotions);
                return data.text;
              }
              return prevText;
            });
          }
        } catch (error) {
          console.error('Speech text fetch error:', error);
        }
      }, 1000);
    }

    return () => {
      if (statusInterval) clearInterval(statusInterval);
      if (speechInterval) clearInterval(speechInterval);
    };
  }, [analysisActive, analysisComplete, token, questionNumber, speechText, currentEmotions]);

  // Initial load effect
  useEffect(() => {
    fetchStoredResults();
  }, [questionNumber]);

  // Timer effect remains the same...
  useEffect(() => {
    let timer;
    if (analysisActive && analysisStartTime && !analysisComplete) {
      timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - analysisStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [analysisActive, analysisStartTime, analysisComplete]);

  // Fetch question function
  const fetchLatestPracticeQuestion = async (questionNum) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/latest-practice/questions/${questionNum}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Soru getirilemedi');

      const data = await response.json();
      setCurrentQuestion(data);
      return data;
    } catch (error) {
      setError('Soru yüklenirken bir hata oluştu');
      throw error;
    }
  };

  // Start Analysis function
  const startAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const questionData = await fetchLatestPracticeQuestion(questionNumber);

      // Reset states
      setAnalysisResults(null);
      setCurrentEmotions({ face: [], audio: [] });
      setSpeechText('');
      setSpeechActive(true);
      setAnalysisActive(true);
      setAnalysisComplete(false);
      setAnalysisStartTime(Date.now());
      setCompletedRounds(0);
      setTotalAnalyses(0);
      emotionHistoryRef.current = [];
      analysisResultsRef.current = null;

      const response = await fetch(`${BASE_URL}/api/start_analysis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: questionData.practiceId,
          questionNumber: questionNumber,
          questionText: questionData.question.text
        })
      });

      if (!response.ok) throw new Error('Analiz başlatılamadı');

      const data = await response.json();
      if (data.status === 'success') {
        if (data.results) {
          setAnalysisResults(data.results);
          analysisResultsRef.current = data.results;
          await storeData(currentEmotions, data.results);
        }
        setAnalysisComplete(true);
      } else {
        throw new Error(data.message || 'Analiz başlatılamadı');
      }
    } catch (error) {
      console.error('Analiz başlatma hatası:', error);
      setError('Analiz başlatılırken bir hata oluştu');
      setSpeechActive(false);
      setAnalysisActive(false);
    } finally {
      setLoading(false);
    }
  };

  // Stop Analysis function
// Frontend - stopAnalysis fonksiyonu güncellemesi
const stopAnalysis = async () => {
  try {
    setNavigating(true);

    // Store final data before stopping
    if (analysisResultsRef.current) {
      await storeData(currentEmotions, analysisResultsRef.current);
    }

    const response = await fetch(`${BASE_URL}/api/stop_analysis`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        questionText: currentQuestion?.question?.text,
        questionId: currentQuestion?.practiceId,
        questionNumber: questionNumber,
        userId: localStorage.getItem('userId'),
        emotionHistory: emotionHistoryRef.current,
        finalResults: analysisResultsRef.current
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Analiz durdurulamadı');
    }

    const data = await response.json();
    
    // Değerlendirme sonuçlarını database'e kaydet
    if (data.evaluation) {
      const assessmentResponse = await fetch(
        `http://localhost:3000/api/latest-practice/assessment/${questionNumber}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assessmentReport: data.evaluation.evaluation_text,
            totalScore: data.evaluation.total_score,
            questionId: currentQuestion?.practiceId,
            userId: localStorage.getItem('userId')
          })
        }
      );

      if (!assessmentResponse.ok) {
        console.error('Değerlendirme sonuçları kaydedilemedi');
      }
    }

    setAnalysisActive(false);
    setSpeechActive(false);
    navigate(`/question-view/${parseInt(questionNumber) + 1}`);

  } catch (error) {
    console.error('Analiz durdurma hatası:', error);
    setError(`Analiz durdurulurken bir hata oluştu: ${error.message}`);
    setNavigating(false);
  }
};

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // UI Render
  return (
    <div className="ml-32 min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2 rounded-xl font-bold">
                Soru {questionNumber}
              </div>
              {currentQuestion && (
                <h2 className="text-xl font-semibold animate-fade-in-right">
                  {currentQuestion.question.text}
                </h2>
              )}
            </div>
            {analysisActive && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>Döngü: {completedRounds}/14</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="w-4 h-4" />
                  <span>Analiz: {totalAnalyses}/84</span>
                </div>
                <div className="text-lg font-semibold text-purple-700">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Control Button */}
<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
  {!analysisActive ? (
    <button
      onClick={startAnalysis}
      disabled={loading}
      className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 flex items-center justify-center gap-2"
    >
      {loading ? <LoadingSpinner /> : <Play className="w-5 h-5" />}
      {loading ? 'Yükleniyor...' : 'Analizi Başlat'}
    </button>
  ) : (
    <button
      onClick={stopAnalysis}
      disabled={!analysisComplete || navigating}
      className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
        analysisComplete && !navigating
          ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
    >
      {navigating ? (
        <>
          <LoadingSpinner />
          Sonraki Soruya Geçiliyor...
        </>
      ) : !analysisComplete ? (
        <>
          <LoadingSpinner />
          Analiz Devam Ediyor...
        </>
      ) : (
        <>
          <Square className="w-5 h-5" />
          Analizi Durdur ve Sonraki Soruya Geç
        </>
      )}
    </button>
  )}
</div>

{/* Video Stream */}
<div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
  <div className="flex items-center gap-2 mb-4">
    <Video className="w-5 h-5 text-purple-600" />
    <h3 className="text-lg font-semibold">Yüz Analizi</h3>
  </div>
  <VideoStream />
</div>

{/* Current Emotions */}
{analysisActive && currentEmotions.face.length > 0 && (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-purple-600" />
      Mevcut Duygular
    </h3>
    <div className="space-y-3">
      <div className="p-4 bg-purple-50 rounded-xl">
        <p className="font-medium text-purple-900 face-emotion">
          Yüz: {currentEmotions.face.join(', ')}
        </p>
      </div>
      {currentEmotions.audio.length > 0 && (
        <div className="p-4 bg-purple-50 rounded-xl">
          <p className="font-medium text-purple-900 audio-emotion">
            Ses: {currentEmotions.audio.map(e =>
              `${e.emotion} (${(e.score * 100).toFixed(1)}%)`
            ).join(', ')}
          </p>
        </div>
      )}
    </div>
  </div>
)}

{/* Speech Text */}
{speechActive && speechText && (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <MessageSquare className="w-5 h-5 text-purple-600" />
      Konuşma Metni
    </h3>
    <div className="max-h-48 overflow-y-auto p-4 bg-purple-50 rounded-xl">
      <pre className="whitespace-pre-wrap text-sm text-purple-900 speech-text">
        {speechText}
      </pre>
    </div>
  </div>
)}

{/* Analysis Results */}
{analysisResults && (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
      <BarChart2 className="w-5 h-5 text-purple-600" />
      Analiz Sonuçları
    </h3>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="p-4 bg-purple-50 rounded-xl">
        <p className="text-sm text-purple-900 font-medium">
          Toplam Analiz Sayısı: {analysisResults.total_analyses}
        </p>
      </div>
      <div className="p-4 bg-purple-50 rounded-xl">
        <p className="text-sm text-purple-900 font-medium">
          Eşleşme Sayısı: {analysisResults.match_count}
        </p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <BarChart 
        width={500} 
        height={200} 
        data={[
          { name: 'Stres Skoru', value: analysisResults.stress_score },
          { name: 'Eşleşme Bonusu', value: analysisResults.match_bonus },
          { name: 'Genel Skor', value: analysisResults.general_score }
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
        <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </div>
  </div>
)}
</div>
</div>

{/* Loading Overlay */}
{(analysisActive && !analysisComplete) || navigating ? (
  <div className="fixed bottom-6 right-6">
    <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 border border-purple-100">
      <LoadingSpinner />
      <span className="text-sm font-medium text-purple-700">
        {navigating ? 'Sonraki soruya geçiliyor...' : 'Analiz devam ediyor...'}
      </span>
    </div>
  </div>
) : null}
</div>
)}