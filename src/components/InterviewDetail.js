import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

const InterviewDetail = () => {
  const { interviewId, participantEmail } = useParams();
  const navigate = useNavigate();
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateScores = (responses, totalQuestions) => {
    const allResponses = Array(totalQuestions).fill(null).map((_, index) => {
      return responses.find(r => r.questionNumber === index + 1) || {
        emotionAnalysis: { generalScore: 0 },
        knowledgeAnalysis: { totalScore: 0 }
      };
    });

    const emotionScores = allResponses.map(r => r.emotionAnalysis?.generalScore || 0);
    const knowledgeScores = allResponses.map(r => r.knowledgeAnalysis?.totalScore || 0);

    const avgEmotionScore = emotionScores.reduce((a, b) => a + b) / totalQuestions;
    const avgKnowledgeScore = knowledgeScores.reduce((a, b) => a + b) / totalQuestions;

    return {
      emotionScore: avgEmotionScore,
      knowledgeScore: avgKnowledgeScore
    };
  };

  const calculateFinalScore = (scores, weights) => {
    const emotionWeight = weights.duygusalDegerlendirme / 100;
    const knowledgeWeight = weights.teknikDegerlendirme / 100;
    return (scores.emotionScore * emotionWeight) + (scores.knowledgeScore * knowledgeWeight);
  };

  useEffect(() => {
    const fetchDetailedResults = async () => {
      try {
        const token = localStorage.getItem('companyToken');
        const response = await axios.get(
          `/api/interviews/interview-detail/${interviewId}/${participantEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const updatedData = { ...response.data };
        const totalQuestions = updatedData.interview.totalQuestions || 2; // Default to 2 if not specified
        const scores = calculateScores(updatedData.participant.responses || [], totalQuestions);
        
        updatedData.participant.overallScores = {
          totalEmotionScore: scores.emotionScore,
          totalKnowledgeScore: scores.knowledgeScore,
          finalScore: calculateFinalScore(scores, {
            duygusalDegerlendirme: updatedData.interview.duygusalDegerlendirme,
            teknikDegerlendirme: updatedData.interview.teknikDegerlendirme
          })
        };
        
        setDetailedData(updatedData);
      } catch (err) {
        setError('Detaylı sonuçlar yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedResults();
  }, [interviewId, participantEmail]);

  if (loading) {
    return (
      <div className="ml-96 p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-96 p-4 md:p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!detailedData) return null;

  const { interview = {}, participant = {} } = detailedData;
  const totalQuestions = interview.totalQuestions || 2;

  const renderScoreValue = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : '0';
  };

  const getAllQuestions = () => {
    const questions = new Array(totalQuestions).fill(null).map((_, index) => {
      const existingResponse = (participant.responses || []).find(r => r.questionNumber === index + 1);
      return {
        questionNumber: index + 1,
        ...existingResponse,
        isEmpty: !existingResponse
      };
    });
    return questions;
  };

  return (
    <div className="ml-96 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <button 
            onClick={() => navigate('/company-employees')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            Geri Dön
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {interview.mulakatAdi || 'Mülakat'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Mülakat Detayları
          </p>
        </div>

        <div className="bg-white shadow rounded-lg mb-6 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Katılımcı Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ad Soyad</p>
              <p className="font-medium">
                {participant.firstName} {participant.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{participant.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kayıt Tarihi</p>
              <p className="font-medium">
                {participant.registeredAt 
                  ? new Date(participant.registeredAt).toLocaleString('tr-TR')
                  : 'Belirtilmemiş'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Mülakat Kriterleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Duygusal Değerlendirme Ağırlığı</p>
              <p className="font-medium">%{interview.duygusalDegerlendirme || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teknik Değerlendirme Ağırlığı</p>
              <p className="font-medium">%{interview.teknikDegerlendirme || 0}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg md:text-xl font-semibold">Yanıtlar ve Analizler</h2>
          {getAllQuestions().map((response, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4 md:p-6">
              <div className="mb-4">
                <h3 className="text-base md:text-lg font-medium">
                  Soru {response.questionNumber}
                </h3>
                <p className="text-gray-600 mt-1">
                  {response.questionText || 'Soru metni bulunmuyor'}
                </p>
              </div>

              {response.isEmpty ? (
                <div className="bg-gray-50 rounded-lg p-4 text-gray-500">
                  Bu soru henüz cevaplanmamış
                </div>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium mb-2">Yanıt</h4>
                    <p className="text-gray-700">{response.speechToText || ''}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Duygusal Analiz</h4>
                      <div className="space-y-2">
                        <div className="bg-blue-50 rounded p-3">
                          <p className="text-sm text-gray-600">Stres Skoru</p>
                          <p className="text-lg font-medium">
                            {renderScoreValue(response.emotionAnalysis?.stressScore)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <p className="text-sm text-gray-600">Genel Skor</p>
                          <p className="text-lg font-medium">
                            {renderScoreValue(response.emotionAnalysis?.generalScore)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Teknik Analiz</h4>
                      <div className="bg-yellow-50 rounded p-3">
                        <p className="text-sm text-gray-600">Değerlendirme</p>
                        <p className="mt-1">{response.knowledgeAnalysis?.evaluationText || 'Değerlendirme yapılmadı'}</p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Puan</p>
                          <p className="text-lg font-medium">
                            {renderScoreValue(response.knowledgeAnalysis?.totalScore)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded p-3 mt-2">
                        <p className="text-sm text-gray-600">Detaylı Rapor</p>
                        <p className="mt-1">{response.knowledgeAnalysis?.reportText || 'Rapor bulunmuyor'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-8 bg-white shadow rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Genel Değerlendirme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Duygusal Değerlendirme Skoru</p>
              <p className="text-xl md:text-2xl font-medium mt-1">
                {renderScoreValue(participant.overallScores?.totalEmotionScore)}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Teknik Değerlendirme Skoru</p>
              <p className="text-xl md:text-2xl font-medium mt-1">
                {renderScoreValue(participant.overallScores?.totalKnowledgeScore)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Final Skor</p>
              <p className="text-xl md:text-2xl font-medium mt-1">
                {renderScoreValue(participant.overallScores?.finalScore)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetail;