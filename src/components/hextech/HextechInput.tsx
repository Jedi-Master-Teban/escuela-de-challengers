// HextechInput - Styled input with Hextech aesthetics
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface HextechInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const HextechInput = forwardRef<HTMLInputElement, HextechInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-hextech-gold text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 rounded
              bg-hextech-black/80 text-gray-100
              border-2 transition-all duration-200
              placeholder:text-gray-500
              focus:outline-none
              ${hasError
                ? 'border-red-500 focus:border-red-400 focus:shadow-lg focus:shadow-red-500/20'
                : 'border-hextech-gold/30 focus:border-hextech-gold focus:shadow-lg focus:shadow-hextech-gold/20'
              }
              ${className}
            `}
            {...props}
          />
          {/* Glow effect on focus */}
          <div className={`
            absolute inset-0 rounded pointer-events-none
            transition-opacity duration-200
            ${hasError ? 'bg-red-500/5' : 'bg-hextech-gold/5'}
            opacity-0 focus-within:opacity-100
          `} />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

HextechInput.displayName = 'HextechInput';

export default HextechInput;
