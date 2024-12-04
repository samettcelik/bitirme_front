// QuestionView.js
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function QuestionView() {
  const navigate = useNavigate();
  const { questionNumber } = useParams();
  const practiceData = JSON.parse(localStorage.getItem('practiceQuestions'));
  const currentQuestionNum = parseInt(questionNumber);
  
  const handleStartQuestion = () => {
    navigate(`/question/${questionNumber}`);
  };

  if (!practiceData) {
    navigate('/pratik-olustur');
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[75vw] h-[95vh] flex flex-col items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-6xl text-[#32CD32] font-bold mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800">DİKKAT</h2>
        </div>
        
        <div className="text-center">
          <p className="text-gray-700 text-lg leading-relaxed">
            {currentQuestionNum}. Soruyu Görüntülemek üzeresiniz. <br />
            Lütfen kameraya bakmayı unutmayınız. <br />
            Eğer kameraya bakmazsanız <strong>duygu analizi değerlendirme puanınız beklediğinizden düşük gelecektir</strong>. <br />
            Süreniz 5 dakikadır. Başarılar Dileriz.
          </p>
        </div>
        
        <div className="w-full flex justify-end pr-10">
          <button
            onClick={handleStartQuestion}
            className="bg-[#32CD32] text-white px-10 py-4 rounded-full hover:bg-green-700 text-xl font-bold transition-all duration-300 flex items-center gap-2"
          >
            {currentQuestionNum}. SORU
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
  );
}

export default QuestionView;