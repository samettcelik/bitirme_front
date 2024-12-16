import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Save, PlusCircle } from 'lucide-react';
import axios from 'axios';

// Axios default config
axios.defaults.baseURL = 'http://localhost:3000';

const PratikOlustur = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [emotionPercentage, setEmotionPercentage] = useState(30);
  const [infoPercentage, setInfoPercentage] = useState(70);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const increaseEmotion = () => {
    if (emotionPercentage < 100) {
      const newEmotion = emotionPercentage + 10;
      const newInfo = infoPercentage - 10;
      setEmotionPercentage(newEmotion);
      setInfoPercentage(Math.max(newInfo, 0));
    }
  };

  const increaseInfo = () => {
    if (infoPercentage < 100) {
      const newInfo = infoPercentage + 10;
      const newEmotion = emotionPercentage - 10;
      setInfoPercentage(newInfo);
      setEmotionPercentage(Math.max(newEmotion, 0));
    }
  };

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { id: questions.length + 1, text: '' }]);
    }
  };

  const removeQuestion = () => {
    if (questions.length > 0) {
      setQuestions(questions.slice(0, -1));
    }
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };                          

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const practiceData = {
        pratikAdi: title,
        questions: questions.map(q => ({ text: q.text })),
        duyguAnaliz: emotionPercentage,
        bilgiAnaliz: infoPercentage
      };

      const response = await axios.post('/api/practices', practiceData);
      
      localStorage.setItem('practiceQuestions', JSON.stringify({
        questions: questions,
        totalQuestions: questions.length,
        currentQuestion: 1,
        practiceId: response.data._id
      }));

      navigate('/question-view/1');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-32 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pratik Oluştur</h1>

        <div className="flex items-center mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-700 hover:bg-purple-800 text-white p-2 rounded-full transition-all duration-300"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
          <span className="ml-4 text-gray-700 font-semibold text-xl">Yeni Pratik Ekle</span>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">PRATİK DETAYLARI</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Konu Başlığını Girin:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Başlık girin..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">
                  Soru Sayısı (Max: 5):
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={removeQuestion}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">{questions.length}</span>
                  <button
                    onClick={addQuestion}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                    disabled={questions.length >= 5}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <label className="w-20 font-bold text-gray-700">{`${index + 1}. SORU`}</label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Soruyu yazın..."
                      className="flex-1 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Duygu Analiz Oranı:
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-purple-600">{emotionPercentage}%</span>
                    <button
                      onClick={increaseEmotion}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Bilgi Analiz Oranı:
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-purple-600">{infoPercentage}%</span>
                    <button
                      onClick={increaseInfo}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading || questions.length === 0 || !title}
                  className={`
                    flex items-center space-x-2 
                    bg-gradient-to-r from-purple-600 to-purple-800 
                    text-white px-6 py-3 rounded-xl
                    transition-all duration-300
                    ${(loading || questions.length === 0 || !title) ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-purple-900'}
                  `}
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PratikOlustur;