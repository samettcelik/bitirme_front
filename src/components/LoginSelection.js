import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Backend portu 5000 varsayıldı

// Wave Background Component
const WaveBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
    <div className="absolute w-full h-full overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
        <svg viewBox="0 0 1440 320" className="w-full">
          <path 
            fill="rgba(255, 255, 255, 0.15)" 
            d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
          </path>
        </svg>
      </div>
    </div>
  </div>
);

// Axios interceptors setup
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('companyToken');
    if (token) {
      // Burada Bearer prefix'i ekleniyor
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('companyToken');
      window.location.href = '/login-selection';
    }
    return Promise.reject(error);
  }
);

// LoginSelection Component
const LoginSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('companyToken');
    if (token) {
      navigate('/company/interviews');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <WaveBackground />
      
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-lg bg-opacity-95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TRACK AI</h1>
          <p className="text-gray-600 mt-2">Giriş tipini seçin</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/user-login')}
            className="w-full py-4 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg"
          >
            Kullanıcı Girişi
          </button>

          <button
            onClick={() => navigate('/company-login')}
            className="w-full py-4 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
          >
            Şirket Girişi
          </button>
        </div>
      </div>
    </div>
  );
};

// CompanyLogin Component
const CompanyLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('companyToken');
    if (token) {
      navigate('/company/interviews');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/companies/login`, formData);
      const { token } = response.data;
      // Sadece token'ı kaydediyoruz (Bearer eklenmiyor!)
      localStorage.setItem('companyToken', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/company/interviews');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <WaveBackground />

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-lg bg-opacity-95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TRACK AI</h1>
          <p className="text-gray-600 mt-2">Şirket Hesabına Giriş Yapın</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şirket Email Adresi
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="sirket@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Şirket hesabınız yok mu?{' '}
            <button
              onClick={() => navigate('/company-register')}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Kayıt Ol
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login-selection')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Giriş tipini değiştir
          </button>
        </div>
      </div>
    </div>
  );
};

// CompanyRegister Component
const CompanyRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    taxNumber: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      await axios.post(`${API_URL}/companies/register`, {
        name: formData.name,
        taxNumber: formData.taxNumber,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password
      });

      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');

      setTimeout(() => {
        navigate('/company-login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  const inputClass = "w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700";
  const buttonClass = "w-full py-3 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <WaveBackground />

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 backdrop-blur-lg bg-opacity-95">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TRACK AI</h1>
          <p className="text-gray-600 mt-2">Yeni Şirket Hesabı Oluşturun</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Şirket Adı</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Şirket Adı"
            />
          </div>

          <div>
            <label className={labelClass}>Vergi Numarası</label>
            <input
              type="text"
              name="taxNumber"
              required
              value={formData.taxNumber}
              onChange={handleChange}
              className={inputClass}
              placeholder="Vergi Numarası"
            />
          </div>

          <div>
            <label className={labelClass}>Email Adresi</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="sirket@email.com"
            />
          </div>

          <div>
            <label className={labelClass}>Telefon</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="0500 000 00 00"
            />
          </div>

          <div>
            <label className={labelClass}>Adres</label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Şirket Adresi"
              rows="3"
            />
          </div>

          <div>
            <label className={labelClass}>Şifre</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="********"
            />
          </div>

          <div>
            <label className={labelClass}>Şifre Tekrar</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClass}
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className={buttonClass}
          >
            Kayıt Ol
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <button
              onClick={() => navigate('/company-login')}
              className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Giriş Yap
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login-selection')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Giriş tipini değiştir
          </button>
        </div>
      </div>
    </div>
  );
};

export { LoginSelection, CompanyLogin, CompanyRegister };
