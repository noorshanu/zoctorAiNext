"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/**
 * Tier-4 “Medical Concierge” in Mem_Update (`shared_services/payment_handler.py` tier_4: $50)
 * aligns with CTAs in `tier_suggester.py` / summary engine pointing at this path.
 */
export default function MedicalTourismConciergePage() {
  return (
    <>
      <div className="overflow-hidden">
        <div className="css-1vx3a4p" />
        <Navbar />
        <main className="min-h-[70vh] pt-32 pb-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-prime uppercase tracking-wide mb-2">
              Tier 4 · Medical Concierge
            </p>
            <h1 className="text-4xl sm:text-5xl font-manbold txt-grad mb-6">
              Medical Tourism Concierge
            </h1>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              ZoctorAI helps you explore treatment options abroad: we shortlist hospitals and specialists,
              coordinate next steps, and support your medical tourism journey. This service is billed
              separately from AI report summaries (Health Reveal / Vitality Track).
            </p>
            <div className="rounded-2xl border border-prime/30 bg-slate-50 p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">How pricing works</h2>
              <p className="text-slate-700">
                The Medical Concierge fee is <strong>$50 USD</strong> (adjusted against your treatment
                cost where applicable — see terms at checkout). This matches the Tier-4 product in our
                backend payment configuration.
              </p>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">What happens next</h2>
            <ol className="list-decimal pl-6 space-y-2 text-slate-700 mb-10">
              <li>Create an account and share your medical context (reports, goals, destination preferences).</li>
              <li>Our team uses ZoctorAI insights plus concierge workflows to propose matched providers.</li>
              <li>You review options and move forward with travel and treatment planning.</li>
            </ol>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contactus"
                className="inline-flex justify-center rounded-3xl bg-prime px-6 py-3 font-manbold text-white shadow-lg hover:opacity-95"
              >
                Contact us
              </Link>
              <Link
                href="/signup"
                className="inline-flex justify-center rounded-3xl border-2 border-prime px-6 py-3 font-manbold text-prime hover:bg-prime/10"
              >
                Create account
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex justify-center rounded-3xl border border-slate-300 px-6 py-3 font-medium text-slate-800 hover:bg-slate-50"
              >
                Go to dashboard
              </Link>
            </div>
            <p className="mt-10 text-sm text-slate-500">
              AI-generated summaries and chat are available under your existing ZoctorAI plan; concierge
              coordination is a separate service.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
