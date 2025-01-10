import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  TrendingUp,
  Users,
  BarChart,
  Award,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Building2,
  UserCircle,
  Target,
  Star,
  LineChart,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  Facebook,
  PlayCircle,
  Book,
  Briefcase,
  Zap
} from 'lucide-react';

// Add floating animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;
document.head.appendChild(style);

// ImageCarousel Component
const ImageCarousel = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    "https://r.resimlink.com/xvVLo53B0.jpg",
    "https://r.resimlink.com/3eRLZu.jpg",
    "https://r.resimlink.com/BgUMfl7.jpg"

  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-1000 transform ${
            index === currentImage 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-full opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

// HowToGuide Component
const HowToGuide = () => {
  const [activeGuide, setActiveGuide] = useState('candidate');
  const [currentStep, setCurrentStep] = useState(0);

  const guides = {
    candidate: [
      {
        title: "Hesap Oluşturma",
        description: "Email adresinizle hızlıca kayıt olun ve profilinizi oluşturun.",
        icon: <UserCircle className="w-12 h-12 text-indigo-600" />
      },
      {
        title: "Mülakat Pratiği",
        description: "AI destekli mülakat simülasyonları ile kendinizi geliştirin.",
        icon: <Brain className="w-12 h-12 text-indigo-600" />
      },
      {
        title: "Performans Analizi",
        description: "Detaylı raporlar ile gelişiminizi takip edin.",
        icon: <LineChart className="w-12 h-12 text-indigo-600" />
      }
    ],
    company: [
      {
        title: "Kurumsal Hesap",
        description: "Şirketiniz için özel hesap oluşturun.",
        icon: <Building2 className="w-12 h-12 text-purple-600" />
      },
      {
        title: "Aday Havuzu",
        description: "Adayları değerlendirin ve takip edin.",
        icon: <Users className="w-12 h-12 text-purple-600" />
      },
      {
        title: "Analitik Raporlar",
        description: "Aday performanslarını detaylı raporlarla inceleyin.",
        icon: <BarChart className="w-12 h-12 text-purple-600" />
      }
    ]
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % guides[activeGuide].length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeGuide]);

  return (
    <div className="py-20 bg-gray-50" id="how-it-works" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900" >Nasıl Kullanılır?</h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setActiveGuide('candidate')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeGuide === 'candidate'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Adaylar İçin
            </button>
            <button
              onClick={() => setActiveGuide('company')}
              className={`px-6 py-2 rounded-lg transition-all ${
                activeGuide === 'company'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Şirketler İçin
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides[activeGuide].map((step, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 ${
                currentStep === index ? 'scale-105' : 'scale-100'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// AnimatedFeature Component
const AnimatedFeature = ({ icon: Icon, title, description, color }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative bg-white p-8 rounded-xl shadow-lg group-hover:transform group-hover:-translate-y-1 transition-all">
        <Icon className={`w-12 h-12 ${color} mb-4`} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Main LandingPage Component
const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      title: "AI Destekli Mülakat Platformu",
      description: "Yapay zeka teknolojisi ile mülakat deneyiminizi geliştirin.",
      stats: [
        { value: "+80%", label: "Başarı Artışı" },
        { value: "1K+", label: "Mutlu Kullanıcı" },
        { value: "24/7", label: "Destek" }
      ]
    },
    {
      title: "Gerçek Zamanlı Analiz",
      description: "Performansınızı anlık olarak takip edin ve geliştirin.",
      stats: [
        { value: "25+", label: "Analiz Metriği" },
        { value: "1K+", label: "Günlük Analiz" },
        { value: "98%", label: "Doğruluk" }
      ]
    },
    {
      title: "Kişiselleştirilmiş Deneyim",
      description: "Size özel hazırlanmış performans raporlarını takip edin.",
      stats: [
        { value: "50+", label: "Senaryo" },
        { value: "20+", label: "Diyagramı" },
        { value: "85%", label: "Memnuniyet" }
      ]
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "AI Teknolojisi",
      description: "En gelişmiş yapay zeka algoritmaları ile mülakat simülasyonu",
      color: "text-indigo-600"
    },
    {
      icon: Target,
      title: "Hedef Odaklı",
      description: "Kariyer hedeflerinize uygun özelleştirilmiş pratikler",
      color: "text-purple-600"
    },
    {
      icon: LineChart,
      title: "Detaylı Analiz",
      description: "Performansınızı görselleştiren kapsamlı raporlar",
      color: "text-blue-600"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white bg-opacity-90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                TRACK AI
              </span>
            </div>
            
            <div className="flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Özellikler
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                Nasıl Çalışır
              </a>
              <a href="#kul-deneyim" className="text-gray-600 hover:text-gray-900 transition-colors">
                Kullanıcı Deneyimleri
              </a>
              <a href="#sorulan" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sıkça Sorulan Sorular
              </a>


              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Slides */}
      <div className="pt-20">
        <div className="relative min-h-[600px] bg-gradient-to-r from-indigo-50 to-purple-50">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                      {slide.description}
                    </p>
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {slide.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-3xl font-bold text-indigo-600">
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 
                      text-white rounded-lg hover:shadow-lg transition-all transform 
                      hover:scale-105 flex items-center"
                    >
                      Hemen Başla
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                  <div className="relative">
                    <ImageCarousel />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Özelliklerimiz
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En son teknolojiler ile donatılmış platformumuz, mülakat hazırlığınızı
              bir üst seviyeye taşıyor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedFeature key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* How To Guide Section */}
      <HowToGuide />


   {/* Statistics Section */}
   <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">80%</div>
              <div className="text-indigo-100">En az %80 Başarı Artışı </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">90%</div>
              <div className="text-indigo-100">Müşteri Memnuniyeti</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-indigo-100">Tamamlanan Mülakat</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-indigo-100">Canlı Destek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white" id="kul-deneyim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kullanıcı Deneyimleri
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platformumuzun kullanıcıları neler söylüyor?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Ahmet Y.</h4>
                  <p className="text-gray-600">Yazılım Geliştirici</p>
                </div>
              </div>
              <p className="text-gray-700">
                "TRACK AI sayesinde mülakat süreçlerine çok daha hazırlıklı gidiyorum. 
                Gerçekçi simülasyonlar ve detaylı analizler özgüvenimi artırdı."
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Tech Corp.</h4>
                  <p className="text-gray-600">Yazılım Şirketi</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Aday değerlendirme süreçlerimiz çok daha verimli hale geldi. 
                AI destekli analizler sayesinde en uygun adayları kolayca belirleyebiliyoruz."
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">Zeynep K.</h4>
                  <p className="text-gray-600">Veri Bilimci</p>
                </div>
              </div>
              <p className="text-gray-700">
                "Mülakat pratikleri ve geri bildirimler sayesinde kendimi sürekli 
                geliştirebiliyorum. Harika bir platform!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Kariyerinizde Bir Sonraki Adımı Atmaya Hazır Mısınız?
          </h2>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg 
                hover:shadow-lg transition-all transform hover:scale-105 flex items-center"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

   

      {/* FAQs Section */}
      <div className="bg-white py-16" id="sorulan">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-gray-600">
              Merak ettiklerinize hızlı cevaplar
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {[
                {
                  question: "TRACK AI nasıl çalışır?",
                  answer: "Yapay zeka algoritmalarımız, gerçek mülakat senaryolarını simüle eder ve size özel geri bildirimler sunar."
                },
                {
                  question: "Üyelik ücretli mi?",
                  answer: "Temel özellikler ücretsizdir. Premium özellikler için aylık ve yıllık planlarımız mevcuttur."
                },
                {
                  question: "Hangi sektörler için uygun?",
                  answer: "Yazılım, finans, pazarlama ve daha birçok sektör için özelleştirilmiş mülakat senaryolarımız bulunmaktadır."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-2xl font-bold">TRACK AI</span>
              </div>
              <p className="text-gray-400">
                Yapay zeka destekli mülakat hazırlık platformu
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Erişim</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Özellikler
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    Nasıl Çalışır
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                    İletişim
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  info@trackai.com
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  +90 (533) 476 35 03
                </li>
                <li className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  İzmir, Türkiye
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            © {new Date().getFullYear()} TRACK AI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;