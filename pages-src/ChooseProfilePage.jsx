"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { addFamilyProfile } from "../utils/api";

export default function ChooseProfilePage() {
  const router = useRouter();
  const { isAuthenticated, profiles, activeProfile, setActiveProfile, refreshProfiles } = useAuth();
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("spouse");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("userId") || "";
  }, []);

  const mustChooseKey = userId ? `post_login_ui_${userId}` : "";
  const avatarClasses = [
    "from-pink-500 to-rose-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-violet-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-sky-600",
  ];

  const getAvatarClass = useCallback((seed) => {
    const value = String(seed || "profile");
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % avatarClasses.length;
    return avatarClasses[idx];
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    refreshProfiles?.();
    setReady(true);
  }, [isAuthenticated, refreshProfiles, router]);

  useEffect(() => {
    if (!ready || !isAuthenticated || !mustChooseKey) return;
    const mustChoose = localStorage.getItem(mustChooseKey) === "1";
    if (!mustChoose && activeProfile?.id) {
      router.replace("/dashboard");
    }
  }, [ready, isAuthenticated, activeProfile, mustChooseKey, router]);

  const onSelect = (profile) => {
    setActiveProfile(profile);
    router.replace("/dashboard");
  };

  const onAddProfile = async () => {
    if (!userId || !name.trim()) return;
    try {
      setBusy(true);
      setError("");
      await addFamilyProfile(userId, {
        name: name.trim(),
        relation,
      });
      setName("");
      setRelation("spouse");
      await refreshProfiles?.();
    } catch (e) {
      setError(e?.message || "Could not add profile.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141414] to-[#0b0b0b] text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-semibold text-center tracking-tight">Who&apos;s watching?</h1>
        <p className="text-center text-white/55 mt-3 text-sm sm:text-base">Choose a profile to continue</p>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {(profiles || []).map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => onSelect(profile)}
              className="group text-center"
            >
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-md bg-gradient-to-br ${getAvatarClass(
                  profile.id || profile.name
                )} flex items-center justify-center text-3xl font-bold shadow-lg ring-1 ring-white/15 transition duration-200 group-hover:scale-[1.05] group-hover:ring-white/40`}
              >
                {(profile.name || "P").charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 text-base text-white/90 group-hover:text-white">{profile.name}</p>
            </button>
          ))}

          <div className="rounded-md border border-dashed border-white/30 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">+ Add profile</p>
            <p className="text-xs text-white/60 mt-1">Create for family member</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="mt-3 w-full rounded-md border border-white/20 bg-white/10 px-2.5 py-2 text-sm text-white placeholder:text-white/50"
            />
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="mt-2 w-full rounded-md border border-white/20 bg-white/10 px-2.5 py-2 text-sm text-white"
            >
              <option value="spouse" className="text-black">Spouse</option>
              <option value="parent" className="text-black">Parent</option>
              <option value="child" className="text-black">Child</option>
              <option value="sibling" className="text-black">Sibling</option>
              <option value="other" className="text-black">Other</option>
            </select>
            {error ? <p className="text-[11px] text-red-300 mt-2">{error}</p> : null}
            <button
              type="button"
              disabled={busy}
              onClick={onAddProfile}
              className="mt-3 w-full rounded-md bg-prime py-2 text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-70"
            >
              {busy ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="inline-flex items-center justify-center rounded-md border border-white/35 px-6 py-2.5 text-sm tracking-wide text-white/80 hover:text-white hover:border-white/60 transition"
          >
            Manage Profiles
          </button>
        </div>
      </div>
    </div>
  );
}
