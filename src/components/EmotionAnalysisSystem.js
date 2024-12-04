import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';

export default function EmotionAnalysisSystem() {
  const [analysisActive, setAnalysisActive] = useState(false);
  const [results, setResults] = useState(null);
  const [currentEmotions, setCurrentEmotions] = useState({ face: [], audio: [] });
  const [videoError, setVideoError] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [showQuestion, setShowQuestion] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [speechActive, setSpeechActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(330);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { questionNumber } = useParams();
  const practiceData = JSON.parse(localStorage.getItem('practiceQuestions'));
  const currentQuestionNum = parseInt(questionNumber);

  useEffect(() => {
    if (!practiceData) {
      navigate('/pratik-olustur');
      return;
    }

    let retryTimeout;
    const initializeVideoFeed = () => {
      if (videoRef.current) {
        const videoUrl = `http://localhost:5000/video_feed?t=${new Date().getTime()}`;
        videoRef.current.src = videoUrl;
        videoRef.current.onerror = () => {
          setVideoError(true);
          setTimeout(initializeVideoFeed, 2000);
        };
        videoRef.current.onload = () => setVideoError(false);
      }
    };

    initializeVideoFeed();

    return () => {
      clearTimeout(retryTimeout);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate, practiceData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setTimeRemaining(330);
    setTimerActive(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          if (currentQuestionNum < practiceData.totalQuestions) {
            navigate(`/question-view/${currentQuestionNum + 1}`);
          } else {
            navigate('/dashboard');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startAnalysis = async () => {
    try {
      // Immediately start the timer
      startTimer();

      // Reset other states
      setResults(null);
      setCurrentEmotions({ face: [], audio: [] });
      setSpeechText('');
      setCycleCount(0);
      setShowQuestion(true);
      setSpeechActive(true);
      setButtonDisabled(true);

      // Start analysis
      const response = await fetch('http://localhost:5000/api/start_analysis');
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setAnalysisActive(true);
          setResults(data.results);
        }
      }
    } catch (error) {
      console.error('Start analysis error:', error);
    }
  };

  const stopAnalysis = async () => {
    try {
      await fetch('http://localhost:5000/api/stop_analysis');
      setAnalysisActive(false);
      setShowQuestion(false);
      setSpeechActive(false);
      setTimerActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } catch (error) {
      console.error('Stop analysis error:', error);
    }
  };

  useEffect(() => {
    let speechInterval;

    if (analysisActive && speechActive) {
      speechInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/speech_text');
          const data = await response.json();
          if (data.text) {
            const cycles = (data.text.match(/\[DÖNGÜ \d+\]/g) || []).length;
            setCycleCount(cycles);
            setSpeechText(data.text);

            if (cycles >= 12) {
              setSpeechActive(false);
            }
          }
        } catch (error) {
          console.error('Speech text fetch error:', error);
        }
      }, 2000);
    }

    return () => {
      if (speechInterval) clearInterval(speechInterval);
    };
  }, [analysisActive, speechActive]);

  useEffect(() => {
    let emotionInterval;

    if (analysisActive) {
      emotionInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5000/api/analysis_status');
          const data = await response.json();
          setCurrentEmotions({
            face: data.face_emotions,
            audio: data.audio_emotions
          });
        } catch (error) {
          console.error('Emotion status fetch error:', error);
        }
      }, 1000);
    }

    return () => {
      if (emotionInterval) clearInterval(emotionInterval);
    };
  }, [analysisActive]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">
                Soru {currentQuestionNum}
              </div>
              <h2 className="text-xl font-semibold">
                {practiceData?.questions[currentQuestionNum - 1]?.text || 'Soru yüklenemedi'}
              </h2>
            </div>
            <div className={`text-2xl font-bold ${timerActive ? 'text-blue-600' : 'text-gray-400'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <button
              onClick={analysisActive ? stopAnalysis : startAnalysis}
              disabled={buttonDisabled && !analysisActive}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
                analysisActive 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : buttonDisabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {analysisActive ? 'Analizi Durdur' : 'Analizi Başlat'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Yüz Analizi</h3>
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <img
                ref={videoRef}
                alt="Video analizi"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {videoError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                  <p className="text-white">Video bağlantısı yeniden kuruluyor...</p>
                </div>
              )}
            </div>
          </div>

          {analysisActive && currentEmotions.face.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Mevcut Duygular</h3>
              <div className="space-y-2">
                <p>Yüz: {currentEmotions.face.join(', ')}</p>
                {currentEmotions.audio.length > 0 && (
                  <p>
                    Ses: {currentEmotions.audio.map(e =>
                      `${e.emotion} (${(e.score * 100).toFixed(1)}%)`
                    ).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {speechActive && speechText && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Konuşma Metni {cycleCount > 0 && `(Döngü ${cycleCount}/12)`}
              </h3>
              <div className="max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{speechText}</pre>
              </div>
            </div>
          )}

          {results && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Analiz Sonuçları</h3>
              <div className="overflow-x-auto">
                <BarChart width={500} height={200} data={[
                  { name: 'Stres Skoru', value: results.stress_score },
                  { name: 'Eşleşme Bonusu', value: results.match_bonus },
                  { name: 'Genel Skor', value: results.general_score }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4f46e5" />
                </BarChart>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}