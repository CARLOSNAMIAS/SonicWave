
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Minimize2 } from 'lucide-react';

const ALL_SUGGESTIONS = [
  'Música lofi para estudiar',
  'Noticias mundiales de la BBC',
  'Éxitos alternativos de Japón',
  'Salsa pesada colombiana',
  'Reggaeton de Puerto Rico',
  'Synthwave retro de los 80s',
  'Jazz Manouche francés',
  'Rock alternativo de Reino Unido',
  'Música clásica para concentrarse',
  'Pop actual de Corea (K-Pop)',
  'Podcast de noticias tecnológicas',
  'Ambiente de naturaleza y lluvia',
  'Heavy Metal escandinavo',
  'Bossa Nova de Brasil',
  'Indie pop de México',
];

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AIDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
  aiReasoning: string | null;
}

const AIDJModal: React.FC<AIDJModalProps> = ({ isOpen, onClose, onSubmit, isProcessing, aiReasoning }) => {
  const [input, setInput] = useState('');
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastAiReasoning, setLastAiReasoning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Add AI response as a message when aiReasoning changes
  useEffect(() => {
    if (aiReasoning && aiReasoning !== lastAiReasoning) {
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: aiReasoning,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLastAiReasoning(aiReasoning);
    }
  }, [aiReasoning, lastAiReasoning]);

  useEffect(() => {
    if (isOpen) {
      // Shuffle suggestions
      const shuffled = ALL_SUGGESTIONS.sort(() => 0.5 - Math.random());
      setCurrentSuggestions(shuffled.slice(0, 4));

      // Add welcome message if no messages exist
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          text: '¡Hola! 👋 Soy tu DJ de IA. Dime qué tipo de música buscas y te ayudaré a encontrar la emisora perfecta.',
          sender: 'ai',
          timestamp: new Date(),
        }]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Submit to AI
      onSubmit(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Chat Window */}
      <div
        className={`fixed z-[100] transition-all duration-500 ease-out ${isOpen
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0 pointer-events-none'
          } ${isMinimized ? 'h-16' : 'h-[600px] max-h-[70vh]'
          }`}
        style={{
          bottom: '20px',
          right: '20px',
          width: 'min(380px, calc(100vw - 40px))',
        }}
      >
        <div className="h-full bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-10px_rgba(34,211,238,0.3)] border border-slate-200 dark:border-slate-800/50 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="sonic-gradient p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={20} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-white font-black text-sm tracking-tight">Sonic AI DJ</h3>
                <p className="text-white/70 text-xs font-medium">Siempre en línea</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                <Minimize2 size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Content - Hidden when minimized */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender === 'user'
                        ? 'sonic-gradient text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm shadow-sm'
                        }`}
                    >
                      <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isProcessing && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {currentSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 hover:text-white text-xs font-bold text-slate-600 dark:text-slate-300 rounded-full transition-all border border-transparent hover:border-cyan-500"
                    >
                      {suggestion.length > 20 ? suggestion.substring(0, 20) + '...' : suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className={`w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl pl-4 pr-12 py-3 focus:outline-none transition-all text-sm font-medium border-2 ${input.trim()
                      ? 'border-cyan-500 input-wave'
                      : 'border-transparent focus:border-cyan-500/30'
                      }`}
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sonic-gradient text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-90"
                    title="Enviar mensaje"
                  >
                    <Send size={18} fill="currentColor" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wave Animation Styles */}
      <style>{`
        @keyframes wave {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4),
                        0 0 20px 0 rgba(34, 211, 238, 0.1);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 211, 238, 0),
                        0 0 30px 5px rgba(34, 211, 238, 0.2);
          }
        }

        .input-wave {
          animation: wave 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default AIDJModal;
