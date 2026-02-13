// HextechButton - Premium button component with Hextech styling
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface HextechButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export default function HextechButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: HextechButtonProps) {
  const baseStyles = `
    relative font-semibold rounded overflow-hidden transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-hextech-gold/50
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-hextech-gold to-amber-600 text-hextech-black
      hover:from-amber-400 hover:to-hextech-gold hover:scale-105
      hover:shadow-lg hover:shadow-hextech-gold/25
    `,
    secondary: `
      bg-gradient-to-r from-cyan-500 to-cyan-600 text-white
      hover:from-cyan-400 hover:to-cyan-500 hover:scale-105
      hover:shadow-lg hover:shadow-cyan-500/25
    `,
    outline: `
      border-2 border-hextech-gold/50 text-hextech-gold bg-transparent
      hover:bg-hextech-gold/10 hover:border-hextech-gold
    `,
    ghost: `
      text-gray-400 bg-transparent
      hover:text-hextech-gold hover:bg-hextech-gold/10
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
