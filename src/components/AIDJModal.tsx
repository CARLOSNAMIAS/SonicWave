
import React, { useState } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

interface AIDJModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

const AIDJModal: React.FC<AIDJModalProps> = ({ isOpen, onClose, onSubmit, isProcessing }) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-sonic-darker/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-[0_0_100px_-10px_rgba(34,211,238,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
        <div className="p-8 bg-gradient-to-b from-cyan-500/10 to-transparent flex justify-between items-center border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="sonic-gradient p-2.5 rounded-xl shadow-lg">
              <Sparkles className="text-white" size={24} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Sonic AI DJ</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-10">
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-base font-medium leading-relaxed">
            Dime cómo te sientes o qué estás buscando. Nuestra IA curará la banda sonora perfecta para tu momento.
          </p>

          <form onSubmit={handleSubmit} className="relative mb-10 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: 'Música lofi para una noche lluviosa'..."
              className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl px-8 py-6 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-lg font-bold border border-transparent focus:border-cyan-500/20"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-4 sonic-gradient text-white rounded-xl disabled:opacity-50 disabled:grayscale transition-all shadow-lg active:scale-90"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send size={24} fill="currentColor" />
              )}
            </button>
          </form>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sugerencias</h4>
              <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Metropolis 103.9', 'Jazz para leer', 'Noticias de España', 'Rock clásico 80s', 'Electro Energy'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800/50 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 text-xs font-black text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-transparent hover:shadow-lg hover:shadow-cyan-500/10 uppercase tracking-widest"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDJModal;
