export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export interface DimensionTendency {
  label: string;
  left: string;
  right: string;
  value: number; // 0 to 100, where 0 is left and 100 is right
}

export interface AnalysisResult {
  mostLikely: MBTIType;
  alternatives: MBTIType[];
  tendencies: DimensionTendency[];
  summary: string;
  narrative: string;
  evidence: {
    text: string[];
    image: string[];
  };
  confidence: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AppState {
  step: 'landing' | 'input' | 'analyzing' | 'chat' | 'result';
  language: 'en' | 'zh';
  input: {
    text: string;
    images: string[]; // base64
  };
  analysis: AnalysisResult | null;
  chatHistory: ChatMessage[];
  isRefining: boolean;
}
