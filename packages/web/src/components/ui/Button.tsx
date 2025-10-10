import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-mono uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-white text-black border border-gray-800 hover:bg-gray-100 disabled:hover:bg-white',
      secondary: 'bg-black text-white border border-gray-800 hover:border-gray-700 disabled:hover:border-gray-800',
      ghost: 'bg-transparent text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700 disabled:hover:text-gray-400 disabled:hover:border-gray-800',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
