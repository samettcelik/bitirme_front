import React, { useState, useEffect } from 'react';
import { Building, Video, UserPlus, FileText, BarChart2, Trophy } from 'lucide-react';

const CompanyOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTrophy, setShowTrophy] = useState(false);
  const [showShine, setShowShine] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [goldFlash, setGoldFlash] = useState(false);
  
  const steps = [
    {
      icon: Building,
      title: "Kurumsal Kayıt",
      description: "Şirketiniz için kurumsal hesap oluşturun ve güvenli bir şekilde giriş yapın.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      shadowColor: "shadow-blue-100"
    },
    {
      icon: Video,
      title: "Mülakat Hazırlama",
      description: "Mülakat içeriğini hazırlayın ve katılımcılar için özel bir link oluşturun.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      shadowColor: "shadow-purple-100"
    },
    {
      icon: UserPlus,
      title: "Katılımcı Davet",
      description: "Oluşturulan linki katılımcılarla paylaşın ve mülakatların tamamlanmasını bekleyin.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      shadowColor: "shadow-emerald-100"
    },
    {
      icon: FileText,
      title: "Mülakat Raporları",
      description: "Her katılımcı için detaylı mülakat raporlarını inceleyin.",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      shadowColor: "shadow-amber-100"
    },
    {
      icon: BarChart2,
      title: "Performans Analizi",
      description: "Dashboard üzerinden katılımcıların stres, uyum skorları ve bilgi yeterliliklerini karşılaştırın.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      shadowColor: "shadow-indigo-100"
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setShowShine(true);
        setTimeout(() => {
          setShowTrophy(true);
          setShowConfetti(true);
          setGoldFlash(true);
          setTimeout(() => {
            setShowShine(false);
          }, 2000);
        }, 300);
      }, 800);
    }
  }, [currentStep]);

  return (
    <div className="ml-96 mr-32 py-4 relative">
      <style>{`
        @keyframes shineUp {
          0% { transform: translateY(100%) rotate(-45deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-250%) rotate(-45deg); opacity: 0; }
        }
        @keyframes shineDown {
          0% { transform: translateY(-100%) rotate(-45deg); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(250%) rotate(-45deg); opacity: 0; }
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 0px rgba(255, 215, 0, 0); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
          100% { box-shadow: 0 0 0px rgba(255, 215, 0, 0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes goldFlash {
          0% { color: inherit; }
          50% { color: #FFD700; }
          100% { color: inherit; }
        }
        .trophy-container {
          position: relative;
          animation: glowPulse 2s forwards;
        }
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #FFD700;
          border-radius: 50%;
        }
        .shine-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 45%, rgba(255, 215, 0, 0.2) 50%, transparent 55%);
          animation: shineUp 2s infinite;
        }
        .shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 45%, rgba(255, 215, 0, 0.2) 50%, transparent 55%);
          animation: shineDown 2s infinite 1s;
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #FFD700;
          animation: confetti 3s ease-out forwards;
        }
        .sparkle:nth-child(1) { top: -10px; left: 50%; animation: sparkle 1.5s infinite 0.0s; }
        .sparkle:nth-child(2) { top: 50%; right: -10px; animation: sparkle 1.5s infinite 0.3s; }
        .sparkle:nth-child(3) { bottom: -10px; left: 50%; animation: sparkle 1.5s infinite 0.6s; }
        .sparkle:nth-child(4) { top: 50%; left: -10px; animation: sparkle 1.5s infinite 0.9s; }
        
        .trophy-card {
          background: linear-gradient(45deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255,215,0,0.2);
          animation: glowPulse 2s forwards;
        }
      `}</style>
      
      <div className="relative max-w-2xl mx-auto">
        {/* Confetti Container */}
        {showConfetti && Array.from({ length: 50 }).map((_, index) => (
          <div
            key={index}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#FFD700', '#FF69B4', '#00FF00', '#FF4500'][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}

        {/* Shine effect container */}
        <div 
          className={`absolute inset-0 overflow-hidden transition-opacity duration-1000
            ${showShine ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            zIndex: 40,
            background: 'radial-gradient(circle at center, rgba(255,223,0,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        >
          <div className="shine-effect absolute inset-0" />
        </div>

        {/* Progress Bar */}
        <div className="absolute left-8 top-0 bottom-0 w-3 bg-gray-50 rounded-full shadow-inner" />
        <div 
          className="absolute left-8 top-0 w-3 bg-gradient-to-b from-blue-700 to-blue-900 rounded-full transition-all duration-700 ease-in-out"
          style={{ height: `${(currentStep / steps.length) * 100}%` }}
        />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-start space-x-6 transition-all duration-500 relative
                ${index <= currentStep 
                  ? 'opacity-100 transform translate-x-0' 
                  : 'opacity-0 transform translate-x-16'
                }
                ${index === currentStep ? 'scale-105' : 'scale-100'}
              `}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                zIndex: 45
              }}
            >
              <div className={`
                relative w-14 h-14 rounded-full 
                flex items-center justify-center 
                transform transition-all duration-300
                ${index <= currentStep ? `${step.bgColor} border-2 ${step.borderColor}` : 'bg-gray-50 border-2 border-gray-200'}
                ${index === currentStep ? 'ring-4 ring-blue-100 scale-110' : ''}
                shadow-lg ${index <= currentStep ? step.shadowColor : 'shadow-gray-100'}
              `}>
                <step.icon className={`w-6 h-6 ${
                  index <= currentStep ? step.color : 'text-gray-300'
                }`} />
              </div>

              <div className={`flex-1 pt-2 transition-all duration-300 bg-white/80 rounded-lg p-2 ${
                index === currentStep ? 'transform translate-x-2' : ''
              }`}>
                <h3 className={`text-lg font-semibold mb-1 ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-300'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  index <= currentStep ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trophy Section with Enhanced Effects */}
        <div 
          className={`
            mt-8 text-center transition-all duration-700 relative
            ${showTrophy ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-10 scale-95'}
          `}
          style={{ zIndex: 50 }}
        >
          <div className="trophy-card inline-flex items-center space-x-4 p-6 rounded-2xl relative overflow-hidden">
            <div className="trophy-container bg-blue-50 p-3 rounded-xl relative">
              <Trophy className="w-14 h-14 text-blue-500 animate-bounce" />
              <div className="sparkle"></div>
              <div className="sparkle"></div>
              <div className="sparkle"></div>
              <div className="sparkle"></div>
            </div>
            <div className="text-left relative">
              <h3 className={`text-xl font-bold text-blue-800 mb-1 ${goldFlash ? 'animate-[goldFlash_2s_ease-in-out_forwards]' : ''}`}>
                Tebrikler!
              </h3>
              <p className="text-sm text-gray-600">
                Artık şirketiniz için mülakat sürecini yönetmeye hazırsınız.
              </p>
              <div className="absolute -top-6 -right-6 w-12 h-12 rotate-45 bg-gradient-to-r from-blue-200 to-transparent opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-12 h-12 -rotate-45 bg-gradient-to-r from-blue-200 to-transparent opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOnboarding;