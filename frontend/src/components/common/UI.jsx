import Skeleton from './Skeleton';
import { cn } from '../../utils/cn';
export { Skeleton, cn };

/* ─── Card ────────────────────────────────────────────────── */
export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-white p-4 md:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Button ──────────────────────────────────────────────── */
export function Button({ children, className, variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-dark text-white hover:opacity-90',
    outline: 'bg-transparent border border-dark text-dark hover:bg-dark hover:text-white',
    danger: 'bg-danger text-white hover:opacity-90',
    ghost: 'bg-transparent text-dark hover:bg-gray-100',
  };

  return (
    <button
      className={cn(
        'px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg text-xs md:text-sm font-black uppercase tracking-widest transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        // ✅ Removed px-3.5 — padding-x handled by className prop
        'border border-gray-300 rounded-lg py-2.5 md:py-3 w-full focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300 font-medium text-sm text-dark placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  );
}



/* ─── Badge ────────────────────────────────────────────────── */
export function Badge({ children, className, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    dark: 'bg-dark/10 text-dark',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── Spinner ──────────────────────────────────────────────── */
export function Spinner({ className, size = 20 }) {
  return (
    <svg
      className={cn('animate-spin text-primary', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

/* ─── Divider ──────────────────────────────────────────────── */
export function Divider({ label, className }) {
  if (!label) return <div className={cn('h-px bg-gray-100 my-4', className)} />;
  return (
    <div className={cn('flex items-center gap-4 my-4', className)}>
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[9px] font-black uppercase tracking-[3px] text-muted">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
