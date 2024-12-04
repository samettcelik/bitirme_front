import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL'ini tanımlayalım
const API_URL = 'http://localhost:3000/api/auth';

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
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
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700">
      {/* Animated circle patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left nested circles */}
        <div className="absolute -top-10 -left-10">
          <div className="w-64 h-64 border border-black/20 rounded-full animate-glow-1"></div>
          <div className="absolute left-10 top-10 w-48 h-48 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute left-20 top-20 w-32 h-32 border border-black/20 rounded-full animate-glow-3"></div>
        </div>

        {/* Top right nested circles */}
        <div className="absolute -top-20 right-20">
          <div className="w-80 h-80 border border-black/20 rounded-full animate-glow-random"></div>
          <div className="absolute right-10 top-10 w-60 h-60 border border-black/20 rounded-full animate-glow-random-2"></div>
        </div>

        {/* Center pattern */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 border border-black/20 rounded-full animate-glow-1"></div>
          <div className="absolute left-1/2 top-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-3"></div>
          <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-4"></div>
        </div>

        {/* Bottom left nested circles */}
        <div className="absolute bottom-10 left-20">
          <div className="w-56 h-56 border border-black/20 rounded-full animate-glow-random-3"></div>
          <div className="absolute left-8 top-8 w-40 h-40 border border-black/20 rounded-full animate-glow-random-4"></div>
          <div className="absolute left-16 top-16 w-24 h-24 border border-black/20 rounded-full animate-glow-1"></div>
        </div>

        {/* Bottom right nested circles */}
        <div className="absolute -bottom-20 -right-20">
          <div className="w-72 h-72 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute right-12 bottom-12 w-48 h-48 border border-black/20 rounded-full animate-glow-3"></div>
          <div className="absolute right-24 bottom-24 w-24 h-24 border border-black/20 rounded-full animate-glow-4"></div>
        </div>

        {/* Additional floating circles */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 border border-black/20 rounded-full animate-glow-random"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 border border-black/20 rounded-full animate-glow-random-2"></div>
      </div>

      {/* White Card */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TRACK AI</h1>
          <p className="text-gray-600 mt-2">Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Adresi
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ornek@email.com"
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
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
          >
            Giriş Yap
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            Şifremi Unuttum
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
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
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      // Kayıt işlemi
      await axios.post(`${API_URL}/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Başarılı kayıt mesajı
      setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');

      // 2 saniye sonra login sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700">
      {/* Animated circle patterns - same as Login component */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left nested circles */}
        <div className="absolute -top-10 -left-10">
          <div className="w-64 h-64 border border-black/20 rounded-full animate-glow-1"></div>
          <div className="absolute left-10 top-10 w-48 h-48 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute left-20 top-20 w-32 h-32 border border-black/20 rounded-full animate-glow-3"></div>
        </div>

        {/* Top right nested circles */}
        <div className="absolute -top-20 right-20">
          <div className="w-80 h-80 border border-black/20 rounded-full animate-glow-random"></div>
          <div className="absolute right-10 top-10 w-60 h-60 border border-black/20 rounded-full animate-glow-random-2"></div>
        </div>

        {/* Center pattern */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 border border-black/20 rounded-full animate-glow-1"></div>
          <div className="absolute left-1/2 top-1/2 w-72 h-72 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-3"></div>
          <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 border border-black/20 rounded-full animate-glow-4"></div>
        </div>

        {/* Bottom left nested circles */}
        <div className="absolute bottom-10 left-20">
          <div className="w-56 h-56 border border-black/20 rounded-full animate-glow-random-3"></div>
          <div className="absolute left-8 top-8 w-40 h-40 border border-black/20 rounded-full animate-glow-random-4"></div>
          <div className="absolute left-16 top-16 w-24 h-24 border border-black/20 rounded-full animate-glow-1"></div>
        </div>

        {/* Bottom right nested circles */}
        <div className="absolute -bottom-20 -right-20">
          <div className="w-72 h-72 border border-black/20 rounded-full animate-glow-2"></div>
          <div className="absolute right-12 bottom-12 w-48 h-48 border border-black/20 rounded-full animate-glow-3"></div>
          <div className="absolute right-24 bottom-24 w-24 h-24 border border-black/20 rounded-full animate-glow-4"></div>
        </div>

        {/* Additional floating circles */}
        <div className="absolute top-1/3 left-1/4 w-32 h-32 border border-black/20 rounded-full animate-glow-random"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 border border-black/20 rounded-full animate-glow-random-2"></div>
      </div>

      {/* White Card */}
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TRACK AI</h1>
          <p className="text-gray-600 mt-2">Yeni hesap oluşturun</p>
        </div>

        {error && (
          <div className="mb-4 p-4 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="kullaniciadi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Adresi
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ornek@email.com"
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
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="********"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şifre Tekrar
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 mt-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white text-lg font-bold rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
          >
            Kayıt Ol
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Giriş Yap
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export { Login, Register };