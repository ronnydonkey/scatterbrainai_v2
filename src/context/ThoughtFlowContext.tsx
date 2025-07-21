import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThoughtFlowContextType {
  originalThought: string;
  setOriginalThought: (thought: string) => void;
  selectedInsights: string[];
  setSelectedInsights: (insights: string[]) => void;
  advisorQuestion: string;
  setAdvisorQuestion: (question: string) => void;
  synthesizedThoughts: any[];
  setSynthesizedThoughts: (thoughts: any[]) => void;
  clearFlow: () => void;
}

const ThoughtFlowContext = createContext<ThoughtFlowContextType | undefined>(undefined);

export function ThoughtFlowProvider({ children }: { children: ReactNode }) {
  const [originalThought, setOriginalThought] = useState('');
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [synthesizedThoughts, setSynthesizedThoughts] = useState<any[]>([]);

  const clearFlow = () => {
    setOriginalThought('');
    setSelectedInsights([]);
    setAdvisorQuestion('');
    setSynthesizedThoughts([]);
  };

  return (
    <ThoughtFlowContext.Provider
      value={{
        originalThought,
        setOriginalThought,
        selectedInsights,
        setSelectedInsights,
        advisorQuestion,
        setAdvisorQuestion,
        synthesizedThoughts,
        setSynthesizedThoughts,
        clearFlow
      }}
    >
      {children}
    </ThoughtFlowContext.Provider>
  );
}

export function useThoughtFlow() {
  const context = useContext(ThoughtFlowContext);
  if (!context) {
    throw new Error('useThoughtFlow must be used within a ThoughtFlowProvider');
  }
  return context;
}