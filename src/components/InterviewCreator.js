import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Minus, Save, PlusCircle, Link as LinkIcon, Copy } from "lucide-react";
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const InterviewCreator = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mulakatAdi: "",
    questions: [],
    duygusalDegerlendirme: 30,
    teknikDegerlendirme: 70,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("companyToken");
    if (!token) {
      navigate("/company/login");
      return;
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/interviews`, formData);
      
      // Save the generated URL
      const interviewUrl = `${window.location.origin}/interview/${response.data.interview.uniqueUrl}`;
      setGeneratedUrl(interviewUrl);
      setShowSuccess(true);
      setShowForm(false);
    } catch (err) {
      console.error('Hata:', err.response || err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("companyToken");
        navigate("/company/login");
      } else {
        setError(err.response?.data?.message || "Mülakat oluşturulurken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  const validateForm = () => {
    if (!formData.mulakatAdi.trim()) {
      setError("Mülakat başlığı zorunludur");
      return false;
    }
    if (formData.questions.length === 0) {
      setError("En az bir soru eklemelisiniz");
      return false;
    }
    if (formData.questions.some((q) => !q.text.trim())) {
      setError("Tüm soruların doldurulması zorunludur");
      return false;
    }
    return true;
  };

  const handleTitleChange = (e) => {
    setFormData({ ...formData, mulakatAdi: e.target.value });
  };

  const addQuestion = () => {
    if (formData.questions.length < 5) {
      setFormData({
        ...formData,
        questions: [...formData.questions, { text: "" }],
      });
    }
  };

  const removeQuestion = () => {
    if (formData.questions.length > 0) {
      setFormData({
        ...formData,
        questions: formData.questions.slice(0, -1),
      });
    }
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { text: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const adjustRatings = (type) => {
    if (type === "duygusal" && formData.duygusalDegerlendirme < 100) {
      setFormData({
        ...formData,
        duygusalDegerlendirme: formData.duygusalDegerlendirme + 10,
        teknikDegerlendirme: formData.teknikDegerlendirme - 10,
      });
    } else if (type === "teknik" && formData.teknikDegerlendirme < 100) {
      setFormData({
        ...formData,
        teknikDegerlendirme: formData.teknikDegerlendirme + 10,
        duygusalDegerlendirme: formData.duygusalDegerlendirme - 10,
      });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Mülakat Formu Oluştur
        </h1>

        {!showSuccess && (
          <div className="flex items-center mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="h-6 w-6" />
            </button>
            <span className="ml-4 text-gray-700 font-semibold text-xl">
              Yeni Mülakat Formu Ekle
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200 mb-6">
            <div className="flex items-center mb-4">
              <LinkIcon className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">
                Mülakat Başarıyla Oluşturuldu!
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Aşağıdaki linki mülakat katılımcılarıyla paylaşabilirsiniz:
            </p>
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 bg-transparent border-none focus:ring-0"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-blue-600 hover:text-blue-700 focus:outline-none"
                title="Linki Kopyala"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm mt-2">
                Link kopyalandı!
              </p>
            )}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setShowForm(true);
                  setFormData({
                    mulakatAdi: "",
                    questions: [],
                    duygusalDegerlendirme: 30,
                    teknikDegerlendirme: 70,
                  });
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Yeni Mülakat Oluştur
              </button>
              <button
                onClick={() => navigate("/company/dashboard")}
                className="text-gray-600 hover:text-gray-700"
              >
                Dashboard'a Dön
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              MÜLAKAT FORMU BİLGİLERİ
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold">
                  Mülakat Başlığı:
                </label>
                <input
                  value={formData.mulakatAdi}
                  onChange={handleTitleChange}
                  placeholder="Mülakat başlığını giriniz..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-semibold">
                  Soru Sayısı (Maksimum: 5):
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={removeQuestion}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold w-8 text-center">
                    {formData.questions.length}
                  </span>
                  <button
                    onClick={addQuestion}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formData.questions.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <label className="w-24 font-semibold text-gray-700">{`${index + 1}. Soru`}</label>
                    <input
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Mülakat sorusunu giriniz..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Duygusal Değerlendirme Oranı:
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-blue-600">
                      {formData.duygusalDegerlendirme}%
                    </span>
                    <button
                      onClick={() => adjustRatings("duygusal")}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Teknik Değerlendirme Oranı:
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-bold text-blue-600">
                      {formData.teknikDegerlendirme}%
                    </span>
                    <button
                      onClick={() => adjustRatings("teknik")}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? "Kaydediliyor..." : "Mülakatı Kaydet"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewCreator;