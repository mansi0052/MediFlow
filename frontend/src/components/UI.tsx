import type { ReactNode, ButtonHTMLAttributes } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-sage-100 p-5 ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display font-semibold text-lg text-sage-600 mb-3">{children}</h2>;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-sage-500 text-white hover:bg-sage-600',
    danger: 'bg-coral-500 text-white hover:bg-coral-600',
    ghost: 'bg-sage-50 text-sage-600 hover:bg-sage-100'
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-sage-100 text-sage-600',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-coral-100 text-coral-600'
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${tones[tone]}`}>{children}</span>;
}