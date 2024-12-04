import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

const PratikOlustur = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [emotionPercentage, setEmotionPercentage] = useState(30);
  const [infoPercentage, setInfoPercentage] = useState(70);

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
    if (questions.length < 5) { // Maximum 5 questions
      setQuestions([...questions, { id: questions.length + 1, text: '' }]);
    }
  };

  const removeQuestion = () => {
    if (questions.length > 0) setQuestions(questions.slice(0, -1));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    // Save questions to localStorage for access across components
    localStorage.setItem('practiceQuestions', JSON.stringify({
      questions: questions,
      totalQuestions: questions.length,
      currentQuestion: 1
    }));
    navigate('/question-view/1');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Pratik Oluştur</h1>

      <div className="flex items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="border text-white bg-black px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#32CD32] hover:text-black"
        >
          +
        </button>
        <span className="ml-4 text-gray-700 font-bold text-xl">Yeni Pratik Ekle</span>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">PRATİK DETAYLARI</h2>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Konu Başlığını Girin:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label className="text-gray-700 font-medium mr-4">
              Kaç Adet Soru Sormak İstersiniz? (Max: 5)
            </label>
            <button
              onClick={removeQuestion}
              className="text-white bg-red-500 px-3 py-1 rounded-md mr-2"
            >
              -
            </button>
            <span className="text-lg font-bold">{questions.length}</span>
            <button
              onClick={addQuestion}
              className="text-white bg-green-500 px-3 py-1 rounded-md ml-2"
              disabled={questions.length >= 5}
            >
              +
            </button>
          </div>

          <div className="mb-4">
            {questions.map((question, index) => (
              <div key={index} className="flex items-center mb-2">
                <label className="w-16 font-bold text-gray-700">{`${index + 1}.SORU`}</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder="Soruyu yazın..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Genel Duygu Analiz Yüzde Oranı:
            </label>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-4">{emotionPercentage}%</span>
              <button
                onClick={increaseEmotion}
                className="text-white bg-green-500 px-3 py-1 rounded-md"
              >
                +10
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Genel Bilgi Analiz Yüzde Oranı:
            </label>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-4">{infoPercentage}%</span>
              <button
                onClick={increaseInfo}
                className="text-white bg-green-500 px-3 py-1 rounded-md"
              >
                +10
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={questions.length === 0}
              className={`text-white bg-gradient-to-r from-black via-[#32CD32] to-black px-6 py-2 rounded-full transition-all duration-300 ${
                questions.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-black hover:via-red-600 hover:to-black'
              }`}
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PratikOlustur;