'use client';

import { motion } from 'framer-motion';

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false }) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E2E8F0] shadow-sm ${hover ? 'transition-shadow duration-200 hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#0F172A] text-white hover:bg-[#1E293B] active:scale-[0.98]',
    accent: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-[0.98]',
    secondary:
      'bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] border border-[#E2E8F0] active:scale-[0.98]',
    ghost: 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569]',
    accent: 'bg-[#EFF6FF] text-[#2563EB]',
    success: 'bg-[#F0FDF4] text-[#16A34A]',
    warning: 'bg-[#FFFBEB] text-[#D97706]',
    danger: 'bg-[#FEF2F2] text-[#DC2626]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard() {
  return (
    <Card className="p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </Card>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ icon: Icon, title, description, badge }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#2563EB]" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
          {description && <p className="text-sm text-[#94A3B8] mt-0.5">{description}</p>}
        </div>
      </div>
      {badge && badge}
    </div>
  );
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className = '' }) {
  return <hr className={`border-[#E2E8F0] ${className}`} />;
}
