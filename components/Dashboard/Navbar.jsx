"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "../../AuthProvider";
import { BsTelegram } from "react-icons/bs";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

const socialClass =
  "flex h-9 w-9 items-center justify-center rounded-lg text-lg text-white/70 transition hover:bg-white/10 hover:text-prime focus:outline-none focus:ring-2 focus:ring-prime/50";

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout, profiles = [], activeProfile, setActiveProfile } = useAuth();
  const [firstName, setFirstName] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      let name = localStorage.getItem("firstName") || "";
      if (!name) {
        try {
          const raw = localStorage.getItem("user");
          if (raw) {
            const u = JSON.parse(raw);
            if (u?.first_name) name = u.first_name;
          }
        } catch {
          /* ignore */
        }
      }
      setFirstName(name.trim());
    } else {
      setFirstName("");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      setDropdownOpen(false);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  const displayName = firstName || "Account";
  const initial = firstName ? firstName.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e0e0e] shadow-sm backdrop-blur-md ">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            ZoctorAI
          </p>
          <p className="truncate text-sm font-semibold text-white sm:text-base">
            Dashboard
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {profiles.length > 1 && (
            <div className="mr-2 hidden sm:block">
              <select
                value={activeProfile?.id || ""}
                onChange={(e) => {
                  const p = profiles.find((x) => x.id === e.target.value);
                  if (p) setActiveProfile?.(p);
                }}
                className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-prime/60"
                aria-label="Switch profile"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id} className="text-black">
                    {p.name} ({p.relation})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className="mr-1 flex items-center rounded-xl border border-white/10 bg-white/5 p-0.5 sm:mr-2"
            aria-label="Social links"
          >
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.instagram.com/"
              className={socialClass}
              aria-label="Instagram"
            >
              <FaInstagram className="text-base" />
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://twitter.com/"
              className={socialClass}
              aria-label="Twitter"
            >
              <FaTwitter className="text-base" />
            </a>
            <span
              className={`${socialClass} cursor-default opacity-35`}
              title="Telegram — link coming soon"
              aria-hidden
            >
              <BsTelegram className="text-base" />
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pl-1.5 pr-3 text-left text-white shadow-sm transition hover:border-prime/40 hover:bg-white/[0.12] focus:outline-none focus:ring-2 focus:ring-prime/60 focus:ring-offset-2 focus:ring-offset-[#0e0e0e]"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-prime to-blue-700 text-sm font-bold text-white shadow-inner">
                {initial}
              </span>
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                {displayName}
              </span>
              <FiChevronDown
                className={`h-4 w-4 shrink-0 text-white/60 transition ${dropdownOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl ring-1 ring-black/5"
              >
                {profiles.length > 1 && (
                  <>
                    <p className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-500">Switch profile</p>
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setActiveProfile?.(p);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-gray-50 ${
                          activeProfile?.id === p.id ? "text-prime font-semibold" : "text-gray-700"
                        }`}
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold">
                          {(p.name || "P").charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </button>
                    ))}
                    <div className="my-0.5 h-px bg-gray-100" />
                  </>
                )}
                <Link
                  href="/profile/"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                >
                  <FaUser className="text-prime" aria-hidden />
                  Profile
                </Link>
                <div className="my-0.5 h-px bg-gray-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <MdLogout className="text-lg" aria-hidden />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
