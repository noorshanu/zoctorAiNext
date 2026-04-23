"use client";

import { useLayoutEffect, useRef } from "react";

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("no window"));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const src = "https://accounts.google.com/gsi/client";
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      const done = () => resolve();
      if (window.google?.accounts?.id) {
        done();
        return;
      }
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", () => reject(new Error("gsi load error")), {
        once: true,
      });
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gsi load error"));
    document.body.appendChild(s);
  });
}

/** Fallback when OAuth client ID is not in env — still visible so users know Google is supported. */
function GoogleSignInFallback({ disabled }) {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <div className={`w-full space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <button
        type="button"
        disabled
        className="flex w-full min-h-[44px] items-center justify-center gap-3 rounded-md border border-white/25 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm opacity-90 cursor-not-allowed"
        title="Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in"
      >
        <GoogleMark className="shrink-0" />
        Continue with Google
      </button>
      {isDev && (
        <p className="text-center text-xs text-amber-200/90 leading-snug">
          Dev: set <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{" "}
          <code className="rounded bg-white/10 px-1">.env.local</code> and restart{" "}
          <code className="rounded bg-white/10 px-1">npm run dev</code>.
        </p>
      )}
    </div>
  );
}

function GoogleMark({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Renders Google Identity Services "Continue with Google" when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.
 * If unset, shows a disabled placeholder + dev hint so the section is never empty.
 */
export default function GoogleAuthButton({ onCredential, disabled }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const divRef = useRef(null);
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;

  useLayoutEffect(() => {
    if (!clientId || !divRef.current) return undefined;

    let cancelled = false;

    const run = () => {
      if (cancelled || !divRef.current || !window.google?.accounts?.id) return;
      divRef.current.innerHTML = "";
      const handleCredential = (res) => {
        if (res?.credential) cbRef.current?.(res.credential);
      };
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      const w = divRef.current.offsetWidth || 320;
      window.google.accounts.id.renderButton(divRef.current, {
        theme: "outline",
        size: "large",
        width: Math.min(400, w),
        text: "continue_with",
        locale: "en",
      });
    };

    loadGsiScript()
      .then(() => {
        requestAnimationFrame(() => {
          if (!cancelled) run();
        });
      })
      .catch(() => {
        /* script blocked or offline */
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    return <GoogleSignInFallback disabled={disabled} />;
  }

  return (
    <div
      ref={divRef}
      className={`w-full flex justify-center [&>div]:w-full ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
      aria-hidden={disabled}
    />
  );
}
