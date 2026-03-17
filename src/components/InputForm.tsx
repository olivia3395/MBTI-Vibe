import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Type as TypeIcon, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InputFormProps {
  onSubmit: (text: string, images: string[]) => void;
  isLoading: boolean;
  t: any;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading, t }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && images.length === 0) return;
    onSubmit(text, images);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-mbti-purple uppercase tracking-widest flex items-center gap-2">
            <TypeIcon size={16} />
            {t.textVibe}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.textPlaceholder}
            className="w-full h-40 p-6 rounded-2xl glass focus:ring-2 focus:ring-mbti-purple-faint focus:border-transparent transition-all resize-none text-lg font-light leading-relaxed outline-none"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-mbti-green uppercase tracking-widest flex items-center gap-2">
            <ImageIcon size={16} />
            {t.visualAesthetic}
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-mbti-green-faint rounded-2xl p-12 text-center cursor-pointer hover:border-mbti-green transition-colors bg-white/20"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              multiple 
              accept="image/*" 
              className="hidden" 
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-mbti-green group-hover:text-mbti-green transition-colors">
                <Upload size={20} />
              </div>
              <p className="text-stone-500 font-light">{t.uploadPrompt}</p>
              <p className="text-xs text-stone-400">{t.uploadSubtext}</p>
            </div>
          </div>

          <AnimatePresence>
            {images.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
              >
                {images.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative aspect-square rounded-xl overflow-hidden shadow-sm group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={isLoading || (!text && images.length === 0)}
            className="group relative px-12 py-4 bg-stone-900 text-white rounded-full font-medium tracking-wide hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 overflow-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{t.perceiving}</span>
              </>
            ) : (
              <>
                <span>{t.cta}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
