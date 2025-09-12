import { useTranslatedText } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  children: string;
  className?: string;
  fallback?: string;
}

export default function TranslatedText({ 
  children, 
  className = '', 
  fallback 
}: TranslatedTextProps) {
  const translatedText = useTranslatedText(children);
  
  return (
    <span className={className}>
      {translatedText || fallback || children}
    </span>
  );
}

// Higher-order component for translating text content
export function withTranslation<T extends { children?: React.ReactNode }>(
  Component: React.ComponentType<T>
) {
  return function TranslatedComponent(props: T) {
    if (typeof props.children === 'string') {
      return (
        <Component {...props}>
          <TranslatedText>{props.children}</TranslatedText>
        </Component>
      );
    }
    return <Component {...props} />;
  };
}