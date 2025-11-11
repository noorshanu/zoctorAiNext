"use client";
import { Suspense } from "react";
import "../i18n";
import AuthProvider from "../AuthProvider";
import Loader from "../components/Loader";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>{children}</Suspense>
    </AuthProvider>
  );
}

