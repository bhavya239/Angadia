import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        <label className="block text-sm justify-start font-medium text-surface-700">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 bg-white border rounded-lg text-surface-900 placeholder-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            transition-shadow duration-200 disabled:bg-surface-50 disabled:text-surface-500
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-surface-300'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
