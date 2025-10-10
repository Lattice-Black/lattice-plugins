import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block font-mono text-xs text-gray-500 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-black border border-gray-800 px-4 py-3 text-white
            font-mono text-sm placeholder:text-gray-600
            focus:outline-none focus:border-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-900' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="font-mono text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
