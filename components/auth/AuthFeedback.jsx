"use client";

/**
 * Theme-aligned alerts for auth screens (dark card + prime accent).
 */
export function AuthError({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-lg border-l-4 border-red-500 bg-red-950/50 px-4 py-3 text-sm text-red-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthInfo({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border-l-4 border-prime bg-prime/10 px-4 py-3 text-sm text-blue-100 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthSuccess({ children, className = "" }) {
  if (!children) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border-l-4 border-emerald-500 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100 ${className}`}
    >
      {children}
    </div>
  );
}
