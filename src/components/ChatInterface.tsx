import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AnalysisResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  initialQuestion: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  history, 
  onSendMessage, 
  isLoading,
  initialQuestion
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col h-[600px] bg-white rounded-[2rem] shadow-xl border border-stone-100 overflow-hidden">
      <div className="p-6 border-bottom border-stone-100 flex items-center gap-3 bg-mbti-blue-faint/30">
        <div className="w-8 h-8 rounded-full bg-mbti-blue flex items-center justify-center text-white shadow-sm">
          <Sparkles size={16} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-stone-900">Vibe Analyst</h3>
          <p className="text-xs text-stone-400">Refining your personality lens</p>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        <div className="flex flex-col gap-2 max-w-[85%]">
          <div className="p-4 rounded-2xl rounded-tl-none bg-mbti-blue-faint/50 text-stone-800 text-sm leading-relaxed border border-mbti-blue-faint">
            {initialQuestion}
          </div>
        </div>

        {history.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-mbti-purple text-white rounded-tr-none shadow-md shadow-mbti-purple-faint' 
                  : 'bg-mbti-green-faint/30 text-stone-800 rounded-tl-none border border-mbti-green-faint'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-mbti-blue text-xs italic">
            <Loader2 className="animate-spin" size={12} />
            Analyst is thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-stone-50 border-t border-stone-100">
        <div className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="w-full pl-6 pr-14 py-4 rounded-full bg-white border border-stone-200 focus:ring-2 focus:ring-mbti-blue-faint outline-none transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-mbti-blue text-white rounded-full hover:bg-mbti-blue-dark disabled:opacity-50 transition-all shadow-md shadow-mbti-blue-faint"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};
