import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Globe, 
  Mic, 
  MicOff, 
  Volume2, 
  Trash2, 
  ArrowRight,
  Bot,
  User as UserIcon,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SUPPORTED_LANGUAGES = [
  { code: 'auto', label: 'Auto-Detect / Any Language', flag: '🌐' },
  { code: 'en', label: 'English', flag: '🇬🇧', speechLang: 'en-US' },
  { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳', speechLang: 'hi-IN' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', speechLang: 'kn-IN' },
  { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳', speechLang: 'ta-IN' },
  { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳', speechLang: 'te-IN' },
  { code: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳', speechLang: 'bn-IN' },
  { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳', speechLang: 'mr-IN' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', speechLang: 'gu-IN' },
  { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸', speechLang: 'es-ES' },
  { code: 'fr', label: 'Français (French)', flag: '🇫🇷', speechLang: 'fr-FR' },
  { code: 'de', label: 'Deutsch (German)', flag: '🇩🇪', speechLang: 'de-DE' },
  { code: 'it', label: 'Italiano (Italian)', flag: '🇮🇹', speechLang: 'it-IT' },
  { code: 'pt', label: 'Português (Portuguese)', flag: '🇵🇹', speechLang: 'pt-PT' },
  { code: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦', speechLang: 'ar-SA' },
  { code: 'ru', label: 'Русский (Russian)', flag: '🇷🇺', speechLang: 'ru-RU' },
  { code: 'ja', label: '日本語 (Japanese)', flag: '🇯🇵', speechLang: 'ja-JP' },
  { code: 'ko', label: '한국어 (Korean)', flag: '🇰🇷', speechLang: 'ko-KR' },
  { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳', speechLang: 'zh-CN' },
];

const GREETINGS_BY_LANG = {
  en: {
    welcome: "Hello! I am your AI Stylist at Style AI. Ask me anything in **any language** about outfits, body shape geometry, makeup matching, or shopping!",
    placeholder: "Ask in any language... (e.g. Best dress for my shape?)",
    quick: ["Outfits for my body shape?", "Lipstick for my undertone?", "Explain how SHAP works", "Where can I shop online?"]
  },
  hi: {
    welcome: "नमस्ते! मैं स्टाइल एआई (Style AI) का आपका निजी फैशन सलाहकार हूँ। मुझसे किसी भी भाषा में कपड़े, बॉडी शेप, मेकअप या ऑनलाइन शॉपिंग के बारे में पूछें!",
    placeholder: "अपनी भाषा में पूछें... (जैसे: मेरे लिए बेस्ट ड्रेस?)",
    quick: ["मेरे शरीर के अनुसार बेस्ट ड्रेस?", "वार्म अंडरटोन के लिए लिपस्टिक?", "SHAP सिफारिश कैसे काम करती है?", "ऑनलाइन शॉपिंग लिंक्स"]
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ! ನಾನು Style AI ನ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಫ್ಯಾಷನ್ ಸಹಾಯಕ. ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಉಡುಪುಗಳು, ಮೇಕಪ್ ಅಥವಾ ಬಣ್ಣಗಳ ಬಗ್ಗೆ ಕೇಳಿ!",
    placeholder: "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...",
    quick: ["ನನ್ನ ದೇಹಕ್ಕೆ ಸೂಕ್ತವಾದ ಉಡುಪು ಯಾವುದು?", "ನನ್ನ ಚರ್ಮಕ್ಕೆ ಯಾವ ಮೇಕಪ್ ಸೂಕ್ತ?", "ಶಾಪಿಂಗ್ ಲಿಂಕ್‌ಗಳು"]
  },
  ta: {
    welcome: "வணக்கம்! நான் Style AI-ன் உங்கள் பிரத்யேக ஆடை மற்றும் ஒப்பனை ஆலோசகர். ஆடைகள், உடலமைப்பு, மேக்கப் பற்றி எம்மொழியிலும் கேளுங்கள்!",
    placeholder: "உங்கள் கேள்வியை தட்டச்சு செய்க...",
    quick: ["எனக்கு ஏற்ற உடை எது?", "எந்த லிப்ஸ்டிக் நிறம் சிறந்தது?", "ஷாப்பிங் இணைப்புகள்"]
  },
  te: {
    welcome: "నమస్కారం! నేను Style AI వ్యక్తిగత స్టైలింగ్ సహాయకుడిని. దుస్తులు, శరీర ఆకృతి, మేకప్ గురించి ఏ భాషలోనైనా అడగండి!",
    placeholder: "మీ ప్రశ్నను టైప్ చేయండి...",
    quick: ["నాకు సరిపోయే డ్రెస్సులు?", "నా స్కిన్ టోన్ కి బెస్ట్ లిప్‌స్టిక్?", "షాపింగ్ లింకులు"]
  },
  es: {
    welcome: "¡Hola! Soy tu estilista personal en Style AI. ¡Pregúntame en cualquier idioma sobre siluetas, maquillaje, colores o compras online!",
    placeholder: "Pregunta en cualquier idioma...",
    quick: ["¿Qué ropa favorece mi silueta?", "¿Qué labial combina conmigo?", "¿Por qué me recomiendan esto (SHAP)?", "Ver tiendas online"]
  },
  fr: {
    welcome: "Bonjour ! Je suis votre styliste IA chez Style AI. Posez-moi vos questions dans n'importe quelle langue sur votre morphologie, maquillage ou garde-robe !",
    placeholder: "Posez votre question...",
    quick: ["Quelle tenue pour ma silhouette ?", "Quel rouge à lèvres choisir ?", "Explications de l'IA (SHAP)", "Voir les boutiques"]
  },
  de: {
    welcome: "Hallo! Ich bin Ihr persönlicher KI-Stylist bei Style AI. Fragen Sie mich in jeder Sprache zu Passformen, Make-up und Farben!",
    placeholder: "Frage in jeder Sprache stellen...",
    quick: ["Welches Outfit passt zu mir?", "Beste Lippenstiftfarben?", "Wie funktioniert SHAP?", "Online-Shopping"]
  },
  ar: {
    welcome: "أهلاً وسهلاً! أنا مستشارك الذكي للأناقة والموضة في Style AI. اسألني بأي لغة عن تناسق الملابس، المكياج والتسوق!",
    placeholder: "اكتب سؤالك بأي لغة...",
    quick: ["ما هي الملابس المناسبة لقوامي؟", "أفضل ألوان المكياج لبشرتي؟", "تفسيرات الذكاء الاصطناعي", "متاجر التسوق المباشر"]
  }
};

export const ChatBox = ({ activeTab, setActiveTab }) => {
  const { user, bodyAnalysis, skinAnalysis } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedLang, setSelectedLang] = useState('auto');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeShape = bodyAnalysis?.classification?.detected_shape || user?.last_body_shape || null;
  const activeSkinTone = skinAnalysis?.monk_tone_name || user?.last_skin_tone || null;
  const activeUndertone = skinAnalysis?.estimated_undertone || 'Warm';
  const activeGender = user?.gender_preference || 'women';

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];
  const langTexts = GREETINGS_BY_LANG[selectedLang] || GREETINGS_BY_LANG['en'];

  // Initialize or reset welcome message when language changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: langTexts.welcome,
          actions: [
            { label: 'AI Stylist Studio', tab: 'studio' },
            { label: 'Fashion Advisor', tab: 'fashion' }
          ],
          quickReplies: langTexts.quick
        }
      ]);
    }
  }, [selectedLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Setup Web Speech API for voice recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLangObj.speechLang || 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLangObj.speechLang || 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown bold / bullet characters for natural speech
      const cleanText = text.replace(/[*#•]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (currentLangObj.speechLang) {
        utterance.lang = currentLangObj.speechLang;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const payload = {
        message: text,
        language: selectedLang,
        gender: activeGender,
        body_shape: activeShape,
        skin_tone: activeSkinTone,
        undertone: activeUndertone,
        conversation_history: messages.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      };

      const res = await api.sendChatMessage(payload);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply,
        actions: res.suggested_actions || [],
        quickReplies: res.quick_replies || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: "I apologize, but I encountered a momentary connection issue. Please verify the Style AI backend is running on http://127.0.0.1:8000.",
          actions: [{ label: 'Check Dashboard', tab: 'dashboard' }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'bot',
        text: langTexts.welcome,
        actions: [
          { label: 'AI Stylist Studio', tab: 'studio' },
          { label: 'Fashion Advisor', tab: 'fashion' }
        ],
        quickReplies: langTexts.quick
      }
    ]);
  };

  return (
    <div className="no-print fixed bottom-6 right-6 z-50">
      
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="group relative flex items-center space-x-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#1C1A18] via-[#2B2724] to-[#631B2A] text-[#FAF8F5] border border-[#D4AF37]/60 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
          title="Open Multilingual AI Stylist Chatbot"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5]/10 flex items-center justify-center border border-[#D4AF37]/50">
              <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#1C1A18]"></span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold tracking-wider uppercase text-[#FAF8F5]">
              AI Stylist Chat
            </div>
            <div className="text-[10px] text-[#D4AF37] font-medium flex items-center space-x-1">
              <Globe className="w-3 h-3" />
              <span>Any Language • 24/7</span>
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`glass-panel border border-[#D4AF37]/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col transition-all duration-300 bg-[#FAF8F5]/95 backdrop-blur-xl ${
            isMinimized 
              ? 'w-80 h-16' 
              : 'w-[92vw] sm:w-[420px] max-w-[440px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C1A18] via-[#2B2724] to-[#631B2A] px-4 py-3 text-white flex items-center justify-between border-b border-[#D4AF37]/30 select-none">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-[#D4AF37]/60">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold tracking-wide text-[#FAF8F5] flex items-center space-x-1.5">
                  <span>Style AI Stylist</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-[#D4AF37] flex items-center space-x-1">
                  <span>Multilingual Intelligence</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Selector Dropdown */}
              <div className="relative group">
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-[#2B2724] text-white text-[11px] font-medium border border-[#D4AF37]/40 rounded-lg px-2 py-1 outline-hidden cursor-pointer hover:border-[#D4AF37] transition-colors"
                  title="Select Chat Language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#1C1A18] text-white">
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minimize / Maximize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-md text-[#D1C7BD] hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Clear Chat */}
              {!isMinimized && (
                <button
                  onClick={clearChat}
                  className="p-1 rounded-md text-[#D1C7BD] hover:text-rose-400 hover:bg-white/10 transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-[#D1C7BD] hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Context Ribbon (Only when not minimized) */}
          {!isMinimized && (
            <div className="px-4 py-1.5 bg-[#F4EFE6] border-b border-[#E2DDD5] text-[10px] text-[#6E645A] flex items-center justify-between">
              <span className="flex items-center space-x-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B]"></span>
                <span>Profile: <strong>{activeShape || 'Balanced Silhouette'}</strong> • <strong>{activeUndertone}</strong> Undertone</span>
              </span>
              <span className="text-[#B8860B] font-semibold uppercase tracking-wider shrink-0 ml-2">
                {currentLangObj.flag} {currentLangObj.code.toUpperCase()}
              </span>
            </div>
          )}

          {/* Messages Body */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start space-x-2 max-w-[88%]">
                    {msg.sender === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 border border-[#D4AF37]/50 shadow-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#1C1A18] text-[#FAF8F5] rounded-br-xs border border-[#D4AF37]/30'
                          : 'bg-white text-[#2B2724] rounded-bl-xs border border-[#E5DECF]'
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* Read Aloud button for bot */}
                      {msg.sender === 'bot' && (
                        <div className="mt-2 pt-2 border-t border-[#F0EBE4] flex items-center justify-between text-[10px] text-[#8C7A6B]">
                          <button
                            onClick={() => handleSpeak(msg.text)}
                            className="flex items-center space-x-1 hover:text-[#B8860B] transition-colors"
                            title="Listen to response"
                          >
                            <Volume2 className="w-3 h-3 text-[#B8860B]" />
                            <span>Read Aloud</span>
                          </button>
                          <span>{msg.timestamp || ''}</span>
                        </div>
                      )}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#631B2A] flex items-center justify-center shrink-0 mt-0.5 border border-[#D4AF37]/40">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Action Navigation Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTab(act.tab);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#1A1715] hover:bg-[#1C1A18] hover:text-[#FAF8F5] border border-[#D4AF37]/60 text-[10px] font-semibold transition-all flex items-center space-x-1 shadow-xs"
                        >
                          <span>✦ {act.label}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick follow-up replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 ml-8">
                      {msg.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(qr)}
                          className="px-2.5 py-1 rounded-full bg-white/80 hover:bg-[#F2ECE4] text-[#6E645A] hover:text-[#1A1715] border border-[#E2DDD5] text-[10px] transition-all"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-center space-x-2 text-[#8C7A6B] text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/50">
                    <Sparkles className="w-3 h-3 animate-spin" />
                  </div>
                  <div className="px-3 py-2 bg-white rounded-2xl rounded-bl-xs border border-[#E5DECF] flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input & Voice Controls */}
          {!isMinimized && (
            <div className="p-3 bg-white border-t border-[#E5DECF]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                {/* Voice Input Mic */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-full border transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                      : 'bg-[#FAF8F5] text-[#6E645A] hover:text-[#1A1715] border-[#E2DDD5] hover:border-[#D4AF37]'
                  }`}
                  title={isListening ? "Listening... click to stop" : "Speak in your language"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={langTexts.placeholder}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E2DDD5] focus:outline-hidden focus:border-[#D4AF37] text-[#1A1715] placeholder:text-[#9E9488]"
                  disabled={loading}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="p-2.5 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
