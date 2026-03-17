/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, ArrowLeft, Globe } from 'lucide-react';
import { AppState, AnalysisResult, ChatMessage } from './types';
import { analyzeVibe, getFollowUpQuestions, refineAnalysis, getChatResponse } from './services/gemini';
import { InputForm } from './components/InputForm';
import { ResultReport } from './components/ResultReport';
import { ChatInterface } from './components/ChatInterface';

const TRANSLATIONS = {
  en: {
    title: "MBTI Vibe ✨",
    hero: "What MBTI vibe does your content give? 🕊️",
    sub: "Analyze the personality lens of a post, a poem, a character, or your own aesthetic. Multimodal, conversational, and perceptive.",
    cta: "Start Analysis 🪄",
    back: "Back",
    perceiving: "Perceiving the Vibe...",
    consulting: "Consulting the personality lens",
    initialVibe: "Initial Vibe Detected 🔍",
    refineSub: "The analyst has some thoughts. Let's refine them.",
    viewReport: "View Full Report 📜",
    disclaimer: "For entertainment and inspiration purposes only. Not a clinical or scientific personality assessment.",
    langPrompt: "Choose your language",
    multimodal: "Multimodal 🖼️",
    multimodalDesc: "Jointly analyzes text and images for a deeper vibe read.",
    conversational: "Conversational 💬",
    conversationalDesc: "Refines the judgment through curious follow-up questions.",
    aesthetic: "Aesthetic 🎨",
    aestheticDesc: "Designed for fun, insight, and shareable results.",
    textVibe: "Textual Vibe ✍️",
    visualAesthetic: "Visual Aesthetic 📸",
    textPlaceholder: "Paste captions, quotes, poems, or a short self-description...",
    uploadPrompt: "Drag & drop or click to upload images",
    uploadSubtext: "Screenshots, photos, or aesthetic collections"
  },
  zh: {
    title: "MBTI 氛围 ✨",
    hero: "你的内容散发着什么样的 MBTI 氛围？🕊️",
    sub: "分析帖子、诗歌、角色或你个人审美的性格透镜。多模态、对话式、敏锐的洞察。",
    cta: "开始分析 🪄",
    back: "返回",
    perceiving: "正在感知氛围...",
    consulting: "正在咨询性格透镜",
    initialVibe: "检测到初步氛围 🔍",
    refineSub: "分析师有一些想法。让我们进一步完善它们。",
    viewReport: "查看完整报告 📜",
    disclaimer: "仅供娱乐和启发。非临床或科学的人格评估。",
    langPrompt: "选择你的语言",
    multimodal: "多模态 🖼️",
    multimodalDesc: "共同分析文本和图像，进行更深层次的氛围读取。",
    conversational: "对话式 💬",
    conversationalDesc: "通过好奇的后续问题完善判断。",
    aesthetic: "审美化 🎨",
    aestheticDesc: "专为趣味、洞察力和可分享的结果而设计。",
    textVibe: "文字氛围 ✍️",
    visualAesthetic: "视觉审美 📸",
    textPlaceholder: "粘贴文案、名言、诗歌或简短的自我介绍...",
    uploadPrompt: "拖放或点击上传图片",
    uploadSubtext: "截图、照片或审美收藏"
  }
};

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'landing',
    language: 'zh',
    input: { text: '', images: [] },
    analysis: null,
    chatHistory: [],
    isRefining: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState('');

  const t = TRANSLATIONS[state.language];

  const startAnalysis = async (text: string, images: string[]) => {
    setIsLoading(true);
    setState(prev => ({ ...prev, step: 'analyzing', input: { text, images } }));
    
    try {
      const result = await analyzeVibe(text, images, state.language);
      const question = await getFollowUpQuestions(result, state.language);
      setInitialQuestion(question);
      setState(prev => ({ ...prev, step: 'chat', analysis: result }));
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(state.language === 'zh' ? "分析过程中出现问题。请重试。" : "Something went wrong during analysis. Please try again.");
      setState(prev => ({ ...prev, step: 'input' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    const newHistory: ChatMessage[] = [...state.chatHistory, { role: 'user', text: message }];
    setState(prev => ({ ...prev, chatHistory: newHistory }));
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(state.analysis!, newHistory, state.language);
      const refined = await refineAnalysis(state.analysis!, [...newHistory, { role: 'model', text: aiResponse }], state.language);
      setState(prev => ({ 
        ...prev, 
        analysis: refined,
        chatHistory: [...newHistory, { role: 'model', text: aiResponse }]
      }));
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showResult = () => {
    setState(prev => ({ ...prev, step: 'result' }));
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      step: 'landing',
      input: { text: '', images: [] },
      analysis: null,
      chatHistory: [],
      isRefining: false
    }));
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'zh' : 'en' }));
  };

  return (
    <div className="min-h-screen selection:bg-rose-100 selection:text-rose-900">
      <div className="atmosphere" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mbti-blue to-mbti-purple flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
            <Sparkles size={18} />
          </div>
          <span className="text-sm font-medium tracking-widest uppercase text-stone-900">{t.title}</span>
        </div>
        <div className="pointer-events-auto flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-medium text-mbti-blue hover:bg-white/60 transition-all"
          >
            <Globe size={14} />
            {state.language === 'en' ? '中文' : 'English'}
          </button>
          <button className="p-2 text-mbti-blue hover:text-mbti-blue-dark transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      <main className="pt-32 px-6">
        <AnimatePresence mode="wait">
          {state.step === 'landing' && (
            <motion.section 
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto text-center space-y-12 py-20"
            >
              <div className="space-y-6">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-5xl md:text-6xl font-serif italic text-stone-900 tracking-tight leading-[1.1] max-w-3xl mx-auto"
                >
                  {t.hero}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed"
                >
                  {t.sub}
                </motion.p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <button 
                  onClick={() => setState(prev => ({ ...prev, step: 'input' }))}
                  className="btn-romantic"
                >
                  {t.cta}
                </button>
              </motion.div>

              <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {[
                  { title: t.multimodal, desc: t.multimodalDesc, color: 'text-mbti-purple' },
                  { title: t.conversational, desc: t.conversationalDesc, color: 'text-mbti-green' },
                  { title: t.aesthetic, desc: t.aestheticDesc, color: 'text-mbti-yellow' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-3 p-8 rounded-[2rem] glass">
                    <h3 className={`text-sm font-medium ${item.color} uppercase tracking-widest`}>{item.title}</h3>
                    <p className="text-sm text-stone-500 font-light leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {state.step === 'input' && (
            <motion.section 
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setState(prev => ({ ...prev, step: 'landing' }))}
                className="mb-12 flex items-center gap-2 text-blue-300 hover:text-blue-500 transition-colors text-sm uppercase tracking-widest font-medium"
              >
                <ArrowLeft size={16} />
                {t.back}
              </button>
              <InputForm onSubmit={startAnalysis} isLoading={isLoading} t={t} />
            </motion.section>
          )}

          {state.step === 'chat' && (
            <motion.section 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif italic text-stone-900">{t.initialVibe}</h2>
                <p className="text-stone-500 font-light">{t.refineSub}</p>
              </div>
              
              <ChatInterface 
                history={state.chatHistory}
                onSendMessage={handleChatMessage}
                isLoading={isLoading}
                initialQuestion={initialQuestion}
              />

              <div className="flex justify-center">
                <button 
                  onClick={showResult}
                  className="px-10 py-4 glass text-blue-600 rounded-full font-medium hover:bg-white/60 transition-all"
                >
                  {t.viewReport}
                </button>
              </div>
            </motion.section>
          )}

          {state.step === 'result' && state.analysis && (
            <motion.section 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultReport 
                result={state.analysis} 
                onRefine={() => setState(prev => ({ ...prev, step: 'chat' }))}
                onReset={reset}
              />
            </motion.section>
          )}

          {state.step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-[#f8fafc] z-[60] flex flex-col items-center justify-center space-y-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 rounded-full border-t-2 border-blue-400"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="text-blue-400" size={40} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif italic text-stone-900">{t.perceiving}</h2>
                <p className="text-blue-300 font-light text-sm tracking-widest uppercase">{t.consulting}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Disclaimer */}
      <footer className="py-12 px-6 text-center space-y-4">
        <p className="text-[10px] text-blue-200 uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
          {t.disclaimer}
        </p>
        <div className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-light">
          © 2026 Yuyao Wang • <a href="mailto:yuyaow@bu.edu" className="hover:text-mbti-blue transition-colors">yuyaow@bu.edu</a>
        </div>
      </footer>
    </div>
  );
}

