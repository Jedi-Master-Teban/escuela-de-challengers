import { useEffect } from 'react';
import { X, CheckCircle, AlertOctagon, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface HextechToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const TYPE_CONFIG = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    borderColor: 'border-green-500/50',
    bgColor: 'bg-green-950/20',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]',
    title: 'Éxito'
  },
  error: {
    icon: <AlertOctagon className="w-5 h-5 text-red-400" />,
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-950/20',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    title: 'Error'
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    borderColor: 'border-yellow-500/50',
    bgColor: 'bg-yellow-950/20',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
    title: 'Atención'
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-400" />,
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-950/20',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    title: 'Información'
  }
};

export default function HextechToast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  isVisible 
}: HextechToastProps) {
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-10 fade-in duration-300`}>
      <div className={`
        relative overflow-hidden min-w-[320px] max-w-[450px]
        p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor} ${config.glowColor}
        backdrop-blur-md flex items-start gap-4
      `}>
        {/* Magic Shine Header */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <div className="mt-0.5">
          {config.icon}
        </div>
        
        <div className="flex-1">
          <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">
            {config.title}
          </h4>
          <p className="text-sm font-medium text-white/90 leading-tight">
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar Animation (Optional) */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-white/20"
          style={{ 
            width: '100%',
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      </div>
      
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
