
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Minus, Volume2, VolumeX } from 'lucide-react';

export const ALL_SUGGESTIONS = [
  'Algo tranquilo para trabajar',
  'Salsa venezolana',
  'Música para bailar',
  'Rock argentino',
  'Jazz',
  'Noticias',
  'Reguetón',
  'Radio de Japón',
  'Clásica',
  'Música de los 80',
  'Algo para dormir',
  'Electrónica',
  'Rancheras',
  'Pódcast de cultura',
  'Metal',
  'Bachata',
  'Salsa brava',
  'Rock alternativo',
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
  onSubmit: (peticion: string) => void;
  isProcessing: boolean;
  aiReasoning: string | null;
  isMuted: boolean;
  toggleMute: () => void;
  isSpeaking: boolean;
}

/**
 * Consola de conversación con el DJ.
 * Panel rectangular anclado a la esquina: cabecera negra con el estado de la voz,
 * transcripción sin globos y una línea de entrada con filete inferior.
 */
const AIDJModal: React.FC<AIDJModalProps> = ({ isOpen, onClose, onSubmit, isProcessing, aiReasoning, isMuted, toggleMute, isSpeaking }) => {
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
          text: 'Dime qué quieres escuchar: un género, un país o un momento del día. Yo busco las emisoras.',
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

      // El DJ guarda por su cuenta lo último que puso, así que no hace falta
      // mandarle el historial de la conversación.
      onSubmit(input);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Fondo de bloqueo en móvil */}
      <div
        className="fixed inset-0 bg-ink/40 z-[90] lg:hidden"
        onClick={onClose}
      />

      <div
        className={`fixed z-[100] ${isMinimized ? 'h-14' : 'h-[600px] max-h-[82vh]'}`}
        style={{
          bottom: '0',
          right: '0',
          width: 'min(400px, 100vw)',
        }}
      >
        <div className="h-full surface-raised flex flex-col overflow-hidden">

          {/* Cabecera */}
          <div className="bg-ink text-paper h-14 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2 h-2 shrink-0 ${isSpeaking ? 'bg-signal animate-signal-blink' : 'bg-signal'}`} />
              <h3 className="font-semibold text-[15px] truncate">DJ de SonicWave</h3>
              <span className="t-data text-[10px] text-white/45 shrink-0">
                {isSpeaking ? 'Hablando' : isProcessing ? 'Buscando' : 'En línea'}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                title={isMuted ? 'Activar voz' : 'Silenciar voz'}
              >
                {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <Minus size={17} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                title="Cerrar"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Transcripción */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {messages.map((message) => (
                  message.sender === 'user' ? (
                    <div key={message.id} className="flex justify-end">
                      <p className="max-w-[85%] bg-ink text-paper dark:bg-paper dark:text-ink px-3.5 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                  ) : (
                    <div key={message.id} className="border-l-2 border-signal pl-3.5">
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                  )
                ))}

                {isProcessing && (
                  <div className="border-l-2 border-signal pl-3.5 flex items-center gap-1.5 h-5">
                    {[0, 0.15, 0.3].map(delay => (
                      <span
                        key={delay}
                        className="w-[3px] h-3 bg-signal animate-sound-wave"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Atajos */}
              <div className="px-4 py-3 shrink-0">
                <div className="flex flex-wrap gap-2">
                  {currentSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2.5 py-1.5 surface text-[12px] text-meta-c hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entrada */}
              <form onSubmit={handleSubmit} className="flex items-stretch shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe qué quieres escuchar"
                  aria-label="Mensaje para el DJ"
                  className="flex-1 min-w-0 bg-transparent h-12 px-4 text-[14px] focus:outline-none placeholder:text-meta-c"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className="w-12 h-12 shrink-0 flex items-center justify-center bg-ink text-paper dark:bg-paper dark:text-ink disabled:opacity-25 hover:bg-signal hover:text-white dark:hover:bg-signal dark:hover:text-white transition-colors"
                  title="Enviar mensaje"
                >
                  <Send size={17} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AIDJModal;
