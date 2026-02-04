
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NEW: Zolver Brand Logo Component
export const ZolverLogo: React.FC<{ className?: string, withText?: boolean }> = ({ className, withText = false }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background shape removed for icon usage, keeping the Z path */}
      <path d="M130 140H382L320 220H130V140Z" fill="currentColor" />
      <path d="M382 140L130 372V400H382L420 300H230L382 160V140Z" fill="currentColor" />
      <path d="M420 300L440 250" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
    </svg>
    {withText && (
      <span className="font-black text-slate-900 dark:text-white tracking-tighter uppercase">
        Zolver<span className="text-orange-500">.lu</span>
      </span>
    )}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}) => {
  const variants = {
    // UPDATED TO ORANGE
    primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg font-semibold',
  };

  return (
    <button
      className={cn(
        'rounded-xl transition-all duration-200 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
      <input
        className={cn(
          // UPDATED RING COLOR
          'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-slate-400',
          error ? 'border-red-500 focus:ring-red-500/50' : '',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, ...props }) => (
  <div
    onClick={onClick}
    className={cn(
      'bg-white dark:bg-slate-850 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5',
      onClick && 'cursor-pointer hover:shadow-md transition-shadow',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const LevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors: Record<string, string> = {
    Novice: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    Professional: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Master: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider', colors[level] || colors.Novice)}>
      {level}
    </span>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'success'; className?: string }> = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/80',
    outline: 'text-foreground border-slate-200 hover:bg-slate-100',
    secondary: 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
    destructive: 'bg-red-500 text-white border-transparent hover:bg-red-600',
    success: 'bg-green-500 text-white border-transparent hover:bg-green-600'
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
};
