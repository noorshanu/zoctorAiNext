"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  FiFileText,
  FiAward,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiArrowRight,
  FiHelpCircle,
  FiExternalLink,
} from "react-icons/fi";
import Layout from "../components/Dashboard/Layout";
import { fetchLocalInfo } from "../utils/api";
import { normalizeApiError } from "../utils/apiErrors";

const FAQ_PREVIEW = 6;

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

function sortTierEntries(pricing) {
  if (!pricing || typeof pricing !== "object") return [];
  return Object.entries(pricing).sort(([a], [b]) => a.localeCompare(b));
}

function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [localInfo, setLocalInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [infoError, setInfoError] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      const mustChoose = localStorage.getItem(`post_login_ui_${storedUserId}`) === "1";
      if (mustChoose) {
        router.replace("/choose-profile");
        return;
      }
    }
    if (storedUserId) setUserId(storedUserId);
    const fn = localStorage.getItem("firstName");
    if (fn) {
      setFirstName(fn);
    } else {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.first_name) setFirstName(u.first_name);
        }
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInfoLoading(true);
      setInfoError(null);
      try {
        const data = await fetchLocalInfo();
        if (!cancelled) setLocalInfo(data);
      } catch (e) {
        if (!cancelled) {
          setInfoError(
            normalizeApiError(e, "Could not load plans and FAQ.").message
          );
        }
      } finally {
        if (!cancelled) setInfoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reportsHref = userId ? "/reports/" : "/login";
  const greeting = firstName
    ? `Welcome back, ${firstName}`
    : "Welcome to ZoctorAI";

  const pricing = localInfo?.pricing;
  const faq = localInfo?.faq;
  const tierRows = sortTierEntries(pricing);
  const faqPreview = (faq?.items || []).slice(0, FAQ_PREVIEW);
  const trustItems = [
    { title: "Security", text: faq?.security },
    { title: "Privacy", text: faq?.privacy },
    { title: "Refunds", text: faq?.refund },
  ].filter((x) => x.text && String(x.text).trim());

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
        </section>

        {/* Pricing (API) */}
        <section className="rounded-2xl border border-gray-200/90 bg-gradient-to-b from-white to-gray-50/80 p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Plans & pricing
              </h2>
              <p className="mt-1 text-gray-600">
                Current tiers from ZoctorAI — upgrade when you need more depth.
              </p>
            </div>
          </div>

          {infoLoading && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-gray-500">
              Loading plans…
            </p>
          )}
          {infoError && !infoLoading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {infoError}{" "}
              <span className="text-gray-600">
                Please try again in a moment.
              </span>
            </div>
          )}
          {!infoLoading && !infoError && tierRows.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tierRows.map(([key, tier]) => (
                <article
                  key={key}
                  className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-prime/40 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-prime">
                    {key.replace("tier_", "Tier ")}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-gray-900">
                    {tier.name || "Plan"}
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {tier.price || "—"}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {tier.description}
                  </p>
                  {tier.link ? (
                    <a
                      href={tier.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-prime px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      Learn more
                      <FiExternalLink className="h-4 w-4" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={reportsHref}
                      className="mt-4 inline-flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-prime/50 hover:bg-gray-50"
                    >
                      Get started
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Trust line from KB */}
        {trustItems.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Trust & policies</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {trustItems.map(({ title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ preview (API) */}
        <section className="rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-prime/10 text-prime">
                <FiHelpCircle className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
                <p className="text-sm text-gray-600">
                  Common questions from our knowledge base
                </p>
              </div>
            </div>
            <Link
              href="/faq/"
              className="text-sm font-semibold text-prime hover:underline"
            >
              View all FAQs
            </Link>
          </div>

          {infoLoading && (
            <p className="text-center text-gray-500 py-6">Loading questions…</p>
          )}
          {!infoLoading && faqPreview.length === 0 && !infoError && (
            <p className="text-center text-gray-500 py-6">No FAQ items available.</p>
          )}
          {!infoLoading && faqPreview.length > 0 && (
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {faqPreview.map((item, idx) => (
                <details
                  key={idx}
                  className="group px-4 py-1 open:bg-gray-50/80"
                >
                  <summary className="cursor-pointer list-none py-3 pr-2 text-left text-sm font-medium text-gray-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-2">
                      <span>{item.question}</span>
                      <span className="mt-0.5 shrink-0 text-gray-400 transition group-open:rotate-180">
                        ▼
                      </span>
                    </span>
                  </summary>
                  <div className="markdown-faq border-t border-gray-100 pb-4 pt-2 text-sm text-gray-600">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-800">{children}</strong>
                        ),
                      }}
                    >
                      {item.answer}
                    </ReactMarkdown>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center pb-4">
          <Link
            href={reportsHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Start your analysis
            <FiFileText className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
