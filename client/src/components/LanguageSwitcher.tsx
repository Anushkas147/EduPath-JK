import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

// Language options with native names
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: "select" | "compact";
}

export default function LanguageSwitcher({ className = "", variant = "select" }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('app_language', languageCode);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChange', { 
      detail: { language: languageCode } 
    }));
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  if (variant === "compact") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${className}`}
        title={`Current: ${currentLang.nativeName}`}
      >
        <Languages className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full px-1 py-0.5 min-w-[16px] text-center">
          {currentLang.code.toUpperCase()}
        </span>
      </Button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Languages className="h-4 w-4 text-muted-foreground" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue>
            <span className="flex items-center space-x-2">
              <span>{currentLang.nativeName}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              <div className="flex items-center space-x-2">
                <span>{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">({language.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook to get current language in other components
export function useLanguage() {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Initialize with saved language
    const savedLanguage = localStorage.getItem('app_language') || 'en';
    setLanguage(savedLanguage);

    // Listen for language changes
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language);
    };

    window.addEventListener('languageChange', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener);
    };
  }, []);

  return language;
}

// Helper function to get text in current language with fallback
export function getText(textObj: Record<string, string>, currentLanguage: string = 'en'): string {
  if (!textObj || typeof textObj !== 'object') {
    return String(textObj || '');
  }
  
  // Try current language first
  if (textObj[currentLanguage] && !textObj[currentLanguage].startsWith('TODO')) {
    return textObj[currentLanguage];
  }
  
  // Fallback to English
  return textObj['en'] || Object.values(textObj)[0] || '';
}