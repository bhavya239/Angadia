import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled, 
  ...props 
}: ButtonProps) {
  
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm',
    secondary: 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 focus:ring-primary-500 px-4 py-2 text-sm',
    outline: 'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 focus:ring-primary-500 px-4 py-2 text-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 px-4 py-2 text-sm',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 px-3 py-1.5 text-sm',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
