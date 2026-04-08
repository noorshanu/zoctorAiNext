"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiFileText,
  FiAward,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import Layout from "../components/Dashboard/Layout";

const features = [
  {
    icon: FiClock,
    title: "Instant analysis",
    description:
      "Upload PDFs and get structured insights in minutes with AI-assisted review.",
    accent: "from-prime/20 to-blue-600/10",
    iconClass: "text-prime",
  },
  {
    icon: FiAward,
    title: "Clinical-grade clarity",
    description:
      "Summaries highlight key values and terms so you can discuss them with your doctor.",
    accent: "from-emerald-500/15 to-emerald-600/5",
    iconClass: "text-emerald-600",
  },
  {
    icon: FiShield,
    title: "Secure & private",
    description:
      "Your uploads are tied to your account and handled with modern transport security.",
    accent: "from-violet-500/15 to-violet-600/5",
    iconClass: "text-violet-600",
  },
  {
    icon: FiTrendingUp,
    title: "Trend-friendly",
    description:
      "Build a library of reports over time to spot patterns in your uploaded documents.",
    accent: "from-amber-500/15 to-amber-600/5",
    iconClass: "text-amber-600",
  },
  {
    icon: FiUsers,
    title: "Share when you choose",
    description:
      "Export or summarize content to share with family or care teams on your terms.",
    accent: "from-rose-500/15 to-rose-600/5",
    iconClass: "text-rose-600",
  },
  {
    icon: FiFileText,
    title: "Plain-language summary",
    description:
      "Turn dense lab PDFs into readable explanations you can actually use.",
    accent: "from-cyan-500/15 to-cyan-600/5",
    iconClass: "text-cyan-600",
  },
];

function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
    const fn = localStorage.getItem("firstName");
    if (fn) {
      setFirstName(fn);
      return;
    }
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.first_name) setFirstName(u.first_name);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const reportsHref = userId ? "/reports/" : "/login";
  const greeting = firstName
    ? `Welcome back, ${firstName}`
    : "Welcome to ZoctorAI";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-14">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-[#0a1628] text-white shadow-xl shadow-slate-900/10">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-prime/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl"
            aria-hidden
          />
          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="text-sm font-medium uppercase tracking-wider text-blue-200/80">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {greeting}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Upload medical reports, run AI analysis, and keep everything in one
              place under{" "}
              <span className="font-medium text-white">Your reports</span> and{" "}
              <span className="font-medium text-white">Get analysis</span>.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={reportsHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-prime px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-prime/25 transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-prime focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <FiFileText className="h-5 w-5 shrink-0" aria-hidden />
                Get report analysis
                <FiArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              </Link>
              <Link
                href="/your-report/"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                View your reports
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section>
          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Why use ZoctorAI
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-gray-600">
              Tools designed around your workflow—from upload to summary to follow-up
              questions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(
              ({ icon: Icon, title, description, accent, iconClass }) => (
                <article
                  key={title}
                  className="group relative flex flex-col rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm transition duration-300 hover:border-prime/30 hover:shadow-md"
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} ring-1 ring-black/5`}
                  >
                    <Icon className={`h-6 w-6 ${iconClass}`} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
                    {description}
                  </p>
                  <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 transition group-hover:opacity-100" />
                </article>
              )
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href={reportsHref}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Start your analysis
              <FiFileText className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
