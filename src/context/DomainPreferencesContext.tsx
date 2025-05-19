import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DomainPreferences {
  includeDomains: string[];
  excludeDomains: string[];
}

interface DomainPreferencesContextType {
  preferences: DomainPreferences;
  addIncludeDomain: (domain: string) => void;
  removeIncludeDomain: (domain: string) => void;
  addExcludeDomain: (domain: string) => void;
  removeExcludeDomain: (domain: string) => void;
  clearAllDomains: () => void;
}

const defaultPreferences: DomainPreferences = {
  includeDomains: [],
  excludeDomains: []
};

const DomainPreferencesContext = createContext<DomainPreferencesContextType | undefined>(undefined);

export function useDomainPreferences() {
  const context = useContext(DomainPreferencesContext);
  if (context === undefined) {
    throw new Error('useDomainPreferences must be used within a DomainPreferencesProvider');
  }
  return context;
}

interface DomainPreferencesProviderProps {
  children: ReactNode;
}

export function DomainPreferencesProvider({ children }: DomainPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<DomainPreferences>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const savedPreferences = localStorage.getItem('domainPreferences');
      if (savedPreferences) {
        try {
          return JSON.parse(savedPreferences);
        } catch (error) {
          console.error('Failed to parse domain preferences from localStorage', error);
        }
      }
    }
    return defaultPreferences;
  });

  // Save to localStorage whenever preferences change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('domainPreferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const addIncludeDomain = (domain: string) => {
    if (!domain.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      includeDomains: prev.includeDomains.includes(domain) 
        ? prev.includeDomains 
        : [...prev.includeDomains, domain]
    }));
  };

  const removeIncludeDomain = (domain: string) => {
    setPreferences(prev => ({
      ...prev,
      includeDomains: prev.includeDomains.filter(d => d !== domain)
    }));
  };

  const addExcludeDomain = (domain: string) => {
    if (!domain.trim()) return;
    
    setPreferences(prev => ({
      ...prev,
      excludeDomains: prev.excludeDomains.includes(domain) 
        ? prev.excludeDomains 
        : [...prev.excludeDomains, domain]
    }));
  };

  const removeExcludeDomain = (domain: string) => {
    setPreferences(prev => ({
      ...prev,
      excludeDomains: prev.excludeDomains.filter(d => d !== domain)
    }));
  };

  const clearAllDomains = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <DomainPreferencesContext.Provider
      value={{
        preferences,
        addIncludeDomain,
        removeIncludeDomain,
        addExcludeDomain,
        removeExcludeDomain,
        clearAllDomains
      }}
    >
      {children}
    </DomainPreferencesContext.Provider>
  );
}
