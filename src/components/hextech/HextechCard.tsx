// HextechCard - Card component with golden corner decorations
import type { ReactNode } from 'react';

interface HextechCardProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'glow';
  className?: string;
  hover?: boolean;
}

export default function HextechCard({
  children,
  variant = 'default',
  className = '',
  hover = true,
}: HextechCardProps) {
  const baseStyles = `
    relative p-6 rounded-lg
    transition-all duration-300
  `;

  const variants = {
    default: 'bg-hextech-blue/50 border border-hextech-gold/20',
    gradient: 'bg-gradient-to-br from-hextech-blue/80 to-hextech-black border border-hextech-gold/20',
    glow: 'bg-hextech-blue/50 border border-hextech-gold/30 shadow-lg shadow-hextech-gold/5',
  };

  const hoverStyles = hover
    ? 'hover:border-hextech-gold/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-hextech-gold/10'
    : '';

  return (
    <div className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hextech-gold/50 rounded-tl" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-hextech-gold/50 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-hextech-gold/50 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-hextech-gold/50 rounded-br" />
      
      {children}
    </div>
  );
}
