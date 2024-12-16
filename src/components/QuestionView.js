import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="ml-32 p-8 bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg w-[75vw] h-[85vh] relative overflow-hidden">
        {/* Purple Gradient Top Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-600 to-purple-800" />

        <div className="p-12 h-full flex flex-col items-center justify-center gap-12">
          {/* Warning Icon and Title */}
          <div className="text-center">
            <div className="mb-6">
              <AlertTriangle className="w-24 h-24 text-purple-600 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              DİKKAT
            </h2>
          </div>

          {/* Warning Message */}
          <div className="max-w-2xl text-center">
            <p className="text-gray-700 text-lg leading-relaxed space-y-2">
              <span className="block font-medium text-xl text-purple-700 mb-4">
                {currentQuestionNum}. Soruyu Görüntülemek üzeresiniz
              </span>
              <span className="block mb-2">
                Lütfen kameraya bakmayı unutmayınız.
              </span>
              <span className="block mb-2">
                Eğer kameraya bakmazsanız{' '}
                <strong className="text-purple-700">
                  duygu analizi değerlendirme puanınız beklediğinizden düşük gelecektir
                </strong>.
              </span>
              <span className="block font-medium">
                Süreniz 5 dakikadır. Başarılar Dileriz.
              </span>
            </p>
          </div>

          {/* Action Button */}
          <div className="w-full flex justify-end mt-8">
            <button
              onClick={handleStartQuestion}
              className="
                flex items-center gap-2 
                bg-gradient-to-r from-purple-600 to-purple-800 
                text-white px-8 py-4 rounded-xl
                hover:from-purple-700 hover:to-purple-900
                transform hover:scale-105
                transition-all duration-300
                font-bold text-lg
              "
            >
              {currentQuestionNum}. SORU
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Purple Gradient Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-800 to-purple-600" />
      </div>
    </div>
  );
}

export default QuestionView;