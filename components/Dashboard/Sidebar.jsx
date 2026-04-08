"use client";
import { useState, useEffect } from "react";
import { FaHome, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { IoAnalyticsOutline } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

function normalizePath(p) {
  if (!p) return "/";
  const t = p.replace(/\/$/, "") || "/";
  return t;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: FaHome,
    match: "/dashboard",
  },
  {
    href: "/profile/",
    label: "Profile",
    icon: FaUser,
    match: "/profile",
  },
  {
    href: "/your-report/",
    label: "Your reports",
    icon: FiFileText,
    match: "/your-report",
  },
  {
    href: "/reports/",
    label: "Get analysis",
    icon: IoAnalyticsOutline,
    match: "/reports",
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const isActive = (matchBase) => {
    const path = normalizePath(pathname);
    const base = normalizePath(matchBase);
    if (path === base) return true;
    return path.startsWith(base + "/");
  };

  const linkClasses = (active) =>
    [
      "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
      active
        ? "border-l-[3px] border-prime bg-prime/15 text-white shadow-sm"
        : "border-l-[3px] border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white",
    ].join(" ");

  const iconWrap = (active) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-colors ${
      active
        ? "bg-prime/25 text-prime"
        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-prime"
    }`;

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-[4.25rem] z-[60] flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#0e0e0e]/95 text-white shadow-lg backdrop-blur-sm transition hover:border-prime/40 hover:bg-[#1a1a1a] lg:hidden"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="dashboard-sidebar"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
      >
        {isOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-full w-[17rem] flex-col border-r border-white/10 bg-[#0e0e0e] text-white shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-4 py-6">
          <Link
            href="/dashboard"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-prime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e0e] rounded-lg"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/images/logo.png"
              alt="ZoctorAI"
              className="mx-auto h-14 w-auto max-w-[140px] object-contain"
            />
          </Link>
          <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Medical intelligence
          </p>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
          aria-label="Main navigation"
        >
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Menu
          </p>
          {navItems.map(({ href, label, icon: Icon, match }) => {
            const active = isActive(match);
            return (
              <Link
                key={href}
                href={href}
                className={linkClasses(active)}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
              >
                <span className={iconWrap(active)} aria-hidden>
                  <Icon className="text-xl" />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-center text-[11px] text-white/35">
            Need help?{" "}
            <Link
              href="/contactus"
              className="font-medium text-prime hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Contact us
            </Link>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
