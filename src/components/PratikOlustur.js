import React, { useState } from "react";

const PratikOlustur = () => {
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal görünürlüğü
  const [questions, setQuestions] = useState([]);
  const [emotionPercentage, setEmotionPercentage] = useState(30);
  const [infoPercentage, setInfoPercentage] = useState(70);
  
  // Modal gösterimi ve kapatma
  const handleModalClose = () => {
    setShowModal(false);
  };
  

  // Genel Duygu Analizi Artırma
  const increaseEmotion = () => {
    if (emotionPercentage < 100) {
      const newEmotion = emotionPercentage + 10;
      const newInfo = infoPercentage - 10;
      setEmotionPercentage(newEmotion);
      setInfoPercentage(Math.max(newInfo, 0));
    }
  };

  // Genel Bilgi Analizi Artırma
  const increaseInfo = () => {
    if (infoPercentage < 100) {
      const newInfo = infoPercentage + 10;
      const newEmotion = emotionPercentage - 10;
      setInfoPercentage(newInfo);
      setEmotionPercentage(Math.max(newEmotion, 0));
    }
  };

  // Soru Ekleme
  const addQuestion = () => setQuestions([...questions, `SORU ${questions.length + 1}`]);
  const removeQuestion = () => {
    if (questions.length > 0) setQuestions(questions.slice(0, -1));
  };


  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Başlık */}
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Pratik Oluştur</h1>

      {/* + Butonu ve Yeni Pratik Ekle */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="border text-white bg-black px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#32CD32] hover:text-black"
        >
          +
        </button>
        <span className="ml-4 text-gray-700 font-bold text-xl">Yeni Pratik Ekle</span>
      </div>

      {/* Form Göster */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">PRATİK DETAYLARI</h2>

          {/* Konu Başlığı Girişi */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Konu Başlığını Girin:
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
            />
          </div>

          {/* Soru Sayısı */}
          <div className="mb-4 flex items-center">
            <label className="text-gray-700 font-medium mr-4">
              Kaç Adet Soru Sormak İstersiniz?
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
            >
              +
            </button>
          </div>

          {/* Sorular */}
          <div className="mb-4">
            {questions.map((question, index) => (
              <div key={index} className="flex items-center mb-2">
                <label className="w-16 font-bold text-gray-700">{`${index + 1}.SORU`}</label>
                <input
                  type="text"
                  placeholder="Soruyu yazın..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#32CD32]"
                />
              </div>
            ))}
          </div>

          {/* Genel Duygu Analizi */}
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

          {/* Genel Bilgi Analizi */}
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
          {/* Kaydet Butonu */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowModal(true)} // Modal'ı göster
              className="text-white bg-gradient-to-r from-black via-[#32CD32] to-black px-6 py-2 rounded-full hover:from-black hover:via-red-600 hover:to-black transition-all duration-300"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}


      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[75vw] h-[95vh] flex flex-col items-center justify-center gap-8">
            {/* İkon ve DİKKAT Başlığı */}
            <div className="text-center">
              <div className="text-6xl text-[#32CD32] font-bold mb-4">⚠️</div>
              <h2 className="text-3xl font-bold text-gray-800">DİKKAT</h2>
            </div>
            {/* Mesaj */}
            <div className="text-center">
              <p className="text-gray-700 text-lg leading-relaxed">
                1. Soruyu Görüntülemek üzeresiniz. <br />
                Lütfen kameraya bakmayı unutmayınız. <br />
                Eğer kameraya bakmazsanız <strong>duygu analizi değerlendirme puanınız beklediğinizden düşük gelecektir</strong>. <br />
                Süreniz 5 dakikadır. Başarılar Dileriz.
              </p>
            </div>
            {/* 1. SORU Butonu */}
            <div className="w-full flex justify-end pr-10">
              <button
                onClick={handleModalClose}
                className="bg-[#32CD32] text-white px-10 py-4 rounded-full hover:bg-green-700 text-xl font-bold transition-all duration-300 flex items-center gap-2"
              >
                1. SORU
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PratikOlustur;