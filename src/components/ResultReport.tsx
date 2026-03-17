import React from 'react';
import { AnalysisResult } from '../types';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Share2, RefreshCw, MessageSquare } from 'lucide-react';

const MBTI_EMOJIS: Record<string, string> = {
  'INTJ': '🧠♟️', 'INTP': '🧪💻', 'ENTJ': '👑📈', 'ENTP': '💡🗣️',
  'INFJ': '🔮✨', 'INFP': '🎨🦋', 'ENFJ': '🤝🌟', 'ENFP': '🌈🎉',
  'ISTJ': '📋⚖️', 'ISFJ': '🛡️🌸', 'ESTJ': '🏛️📢', 'ESFJ': '🍰💌',
  'ISTP': '🛠️🏍️', 'ISFP': '🎨🎭', 'ESTP': '⚡🏎️', 'ESFP': '🎤💃'
};

interface ResultReportProps {
  result: AnalysisResult;
  onRefine: () => void;
  onReset: () => void;
}

export const ResultReport: React.FC<ResultReportProps> = ({ result, onRefine, onReset }) => {
  const getEmoji = (type: string) => {
    const cleanType = type.toUpperCase().replace(/[^A-Z]/g, '');
    return MBTI_EMOJIS[cleanType] || '✨';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-24">
      {/* Hero Result */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-mbti-blue-faint text-mbti-blue text-xs font-medium uppercase tracking-[0.2em]">
          Most Likely Type
        </div>
        <h1 className="text-8xl md:text-9xl font-serif italic bg-gradient-to-br from-mbti-purple via-mbti-blue to-mbti-green bg-clip-text text-transparent tracking-tighter flex items-center justify-center gap-4">
          {result.mostLikely}
          <span className="text-6xl md:text-7xl">{getEmoji(result.mostLikely)}</span>
        </h1>
        <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed">
          {result.summary}
        </p>
      </motion.div>

      {/* Dimensions */}
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <h3 className="text-sm font-medium text-mbti-blue uppercase tracking-widest">Dimensional Tendencies</h3>
          <div className="space-y-10">
            {result.tendencies.map((t, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between text-xs font-medium text-stone-400 uppercase tracking-wider">
                  <span>{t.left}</span>
                  <span>{t.right}</span>
                </div>
                <div className="h-1 bg-mbti-blue-faint rounded-full relative">
                  <motion.div 
                    initial={{ width: 0, left: '50%' }}
                    animate={{ 
                      width: '6px', 
                      left: `${t.value}%` 
                    }}
                    transition={{ delay: 0.5 + idx * 0.1, duration: 1 }}
                    className="absolute top-1/2 -translate-y-1/2 h-4 w-1.5 bg-mbti-blue rounded-full shadow-sm shadow-blue-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-px h-2 bg-mbti-blue-faint" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-8"
        >
          <h3 className="text-sm font-medium text-mbti-green uppercase tracking-widest">Alternative Possibilities</h3>
          <div className="flex flex-wrap gap-4">
            {result.alternatives.map((alt, idx) => (
              <div key={idx} className="px-6 py-4 rounded-2xl glass text-2xl font-serif italic text-mbti-green">
                {alt}
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl glass">
            <div className="text-xs font-medium text-mbti-green uppercase tracking-wider mb-2">Confidence Level</div>
            <div className="text-lg font-medium text-mbti-green">{result.confidence}</div>
          </div>
        </motion.div>
      </div>

      {/* Narrative */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-8 glass p-10 md:p-16 rounded-[2.5rem]"
      >
        <h3 className="text-sm font-medium text-mbti-yellow uppercase tracking-widest">Vibe Interpretation</h3>
        <div className="prose prose-slate prose-lg max-w-none font-light leading-relaxed text-stone-700">
          <ReactMarkdown>{result.narrative}</ReactMarkdown>
        </div>
      </motion.div>

      {/* Evidence */}
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-mbti-purple uppercase tracking-widest">Textual Evidence</h3>
          <ul className="space-y-4">
            {result.evidence.text.map((e, idx) => (
              <li key={idx} className="flex gap-4 text-stone-600 font-light italic">
                <span className="text-mbti-purple-faint text-2xl">“</span>
                <span>{e}</span>
                <span className="text-mbti-purple-faint text-2xl">”</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-mbti-green uppercase tracking-widest">Visual Evidence</h3>
          <ul className="space-y-4">
            {result.evidence.image.map((e, idx) => (
              <li key={idx} className="flex gap-3 text-stone-600 font-light">
                <div className="w-1.5 h-1.5 rounded-full bg-mbti-green-faint mt-2 shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12"
      >
        <button 
          onClick={onRefine}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full hover:shadow-xl transition-all"
        >
          <MessageSquare size={18} />
          Refine with Chat
        </button>
        <button 
          className="flex items-center gap-2 px-8 py-3 glass text-blue-600 rounded-full hover:bg-white/60 transition-all"
        >
          <Share2 size={18} />
          Share Card
        </button>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-3 text-blue-300 hover:text-blue-500 transition-all"
        >
          <RefreshCw size={18} />
          Start Over
        </button>
      </motion.div>
    </div>
  );
};
