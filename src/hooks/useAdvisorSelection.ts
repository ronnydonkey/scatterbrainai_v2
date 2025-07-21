import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Advisor } from '@/data/advisors';

const STORAGE_KEY = 'scatterbrain_selected_advisors';
const MAX_ADVISORS = 5;

export interface AdvisorSelection {
  selectedAdvisors: Advisor[];
  addAdvisor: (advisor: Advisor) => boolean;
  removeAdvisor: (advisorId: string) => void;
  isSelected: (advisorId: string) => boolean;
  clearSelection: () => void;
  canAddMore: boolean;
}

export function useAdvisorSelection(): AdvisorSelection {
  const { user } = useAuth();
  const [selectedAdvisors, setSelectedAdvisors] = useState<Advisor[]>([]);

  // Load saved selection on mount
  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (saved) {
          const advisors = JSON.parse(saved);
          setSelectedAdvisors(advisors);
        }
      } catch (error) {
        console.error('Failed to load advisor selection:', error);
      }
    }
  }, [user]);

  // Save selection whenever it changes
  useEffect(() => {
    if (user && selectedAdvisors.length > 0) {
      try {
        localStorage.setItem(
          `${STORAGE_KEY}_${user.id}`, 
          JSON.stringify(selectedAdvisors)
        );
      } catch (error) {
        console.error('Failed to save advisor selection:', error);
      }
    }
  }, [user, selectedAdvisors]);

  const addAdvisor = (advisor: Advisor): boolean => {
    if (selectedAdvisors.length >= MAX_ADVISORS) {
      return false; // Cannot add more
    }
    
    if (selectedAdvisors.find(a => a.id === advisor.id)) {
      return false; // Already selected
    }

    setSelectedAdvisors(prev => [...prev, advisor]);
    return true;
  };

  const removeAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev => prev.filter(a => a.id !== advisorId));
  };

  const isSelected = (advisorId: string): boolean => {
    return selectedAdvisors.some(a => a.id === advisorId);
  };

  const clearSelection = () => {
    setSelectedAdvisors([]);
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    }
  };

  return {
    selectedAdvisors,
    addAdvisor,
    removeAdvisor,
    isSelected,
    clearSelection,
    canAddMore: selectedAdvisors.length < MAX_ADVISORS
  };
}