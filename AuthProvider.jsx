"use client";
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from "next/navigation";
import {
  refreshAccessToken,
  logoutUser,
  listFamilyProfiles,
  addFamilyProfile,
  fetchUserInfo,
} from './utils/api';
import Loader from "./components/Loader";

export const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showFirstRunSetup, setShowFirstRunSetup] = useState(false);
  const [setupStep, setSetupStep] = useState("choice"); // choice | addFamily | completeProfile
  const [setupFamilyName, setSetupFamilyName] = useState("");
  const [setupFamilyRelation, setSetupFamilyRelation] = useState("spouse");
  const [setupError, setSetupError] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [pickerAddName, setPickerAddName] = useState("");
  const [pickerAddRelation, setPickerAddRelation] = useState("spouse");
  const [pickerAddError, setPickerAddError] = useState("");
  const postLoginUiKey = useCallback((uid) => `post_login_ui_${uid}`, []);

  const profileStorageKey = useCallback((uid) => `active_profile_${uid}`, []);
  const setupSeenKey = useCallback((uid) => `profile_setup_seen_${uid}`, []);

  const isProfileComplete = useCallback((user) => {
    if (!user) return false;
    return Boolean(
      user.first_name &&
      user.last_name &&
      user.phone &&
      user.preferred_language &&
      Array.isArray(user.preferred_contact_methods) &&
      user.preferred_contact_methods.length > 0
    );
  }, []);

  const bootstrapProfiles = useCallback(async () => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;
    const postLoginFlag = localStorage.getItem(postLoginUiKey(uid)) === "1";
    try {
      setProfilesLoading(true);
      const res = await listFamilyProfiles(uid);
      const list = (res?.profiles || []).map((p) => ({
        id: p.profile_id || p.id,
        name: p.name || 'Profile',
        relation: p.relation || 'other',
        isPrimary: Boolean(p.is_primary),
      }));
      setProfiles(list);

      const savedId = localStorage.getItem(profileStorageKey(uid));
      const selected = list.find((p) => p.id === savedId) || list[0] || null;
      setActiveProfile(selected);
      if (selected?.id) {
        localStorage.setItem(profileStorageKey(uid), selected.id);
      }

      const seenSetup = localStorage.getItem(setupSeenKey(uid)) === "1";
      const user = await fetchUserInfo(uid).catch(() => null);
      const needsSetup = !isProfileComplete(user);

      // Show setup prompt only immediately after successful login.
      if (postLoginFlag && !seenSetup && needsSetup) {
        setSetupStep("choice");
        setShowFirstRunSetup(true);
      }

      // Show profile picker only on fresh login.
      if (postLoginFlag && list.length > 1) {
        setShowProfilePicker(true);
      }
    } catch (e) {
      console.error("Profile bootstrap failed:", e);
    } finally {
      // Keep login UI flag until user explicitly selects a profile
      // on the /choose-profile route.
      setProfilesLoading(false);
    }
  }, [isProfileComplete, postLoginUiKey, profileStorageKey, setupSeenKey]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000;
          
          if (Date.now() >= expirationTime) {
            refreshAccessToken()
              .then(response => {
                if (response.status) {
                  localStorage.setItem('accessToken', response.accessToken);
                  setIsAuthenticated(true);
                } else {
                  throw new Error('Token refresh failed');
                }
              })
              .catch(() => {
                localStorage.removeItem('accessToken');
                setIsAuthenticated(false);
              });
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    bootstrapProfiles();
  }, [isAuthenticated, bootstrapProfiles]);

  const login = (token, userData) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('firstName', userData.firstName);
    localStorage.setItem(postLoginUiKey(userData.userId), "1");
    setIsAuthenticated(true);
    // Force a fresh bootstrap for this explicit login event.
    // This guarantees the profile picker appears even if auth state was already true.
    setTimeout(() => {
      bootstrapProfiles();
    }, 0);
  };

  const logout = async () => {
    const uid = localStorage.getItem('userId');
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (uid) {
        localStorage.removeItem(postLoginUiKey(uid));
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('firstName');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setProfiles([]);
      setActiveProfile(null);
      setShowProfilePicker(false);
      setShowFirstRunSetup(false);
    }
  };

  const selectProfile = (profile) => {
    const uid = localStorage.getItem('userId');
    if (!uid || !profile?.id) return;
    setActiveProfile(profile);
    localStorage.setItem(profileStorageKey(uid), profile.id);
    localStorage.removeItem(postLoginUiKey(uid));
    setShowProfilePicker(false);
  };

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

  const completeSetup = () => {
    const uid = localStorage.getItem('userId');
    if (!uid) return;
    localStorage.setItem(setupSeenKey(uid), "1");
    setShowFirstRunSetup(false);
    setSetupStep("choice");
    setSetupError("");
  };

  const handleSetupAddFamily = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !setupFamilyName.trim()) return;
    try {
      setSetupError("");
      await addFamilyProfile(uid, {
        name: setupFamilyName.trim(),
        relation: setupFamilyRelation,
      });
      await bootstrapProfiles();
      completeSetup();
    } catch (e) {
      setSetupError(e?.message || "Could not add family profile.");
    }
  };

  const handlePickerAddProfile = async () => {
    const uid = localStorage.getItem('userId');
    if (!uid || !pickerAddName.trim()) return;
    try {
      setPickerAddError("");
      await addFamilyProfile(uid, {
        name: pickerAddName.trim(),
        relation: pickerAddRelation,
      });
      setPickerAddName("");
      setPickerAddRelation("spouse");
      await bootstrapProfiles();
    } catch (e) {
      setPickerAddError(e?.message || "Could not add profile.");
    }
  };

  useEffect(() => {
    const refreshToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000;
          
          if (Date.now() + 300000 >= expirationTime) {
            const response = await refreshAccessToken();
            if (response.status) {
              localStorage.setItem('accessToken', response.accessToken);
            }
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }
    };

    const interval = setInterval(refreshToken, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <Loader />;
  const canUsePortal = typeof window !== "undefined";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        profiles,
        activeProfile,
        setActiveProfile: selectProfile,
        refreshProfiles: bootstrapProfiles,
      }}
    >
      {children}

      {isAuthenticated && showFirstRunSetup && (
        <div className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            {setupStep === "choice" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Welcome to ZoctorAI</h2>
                <p className="text-gray-600 mt-2">
                  Start by completing your profile or add a family member profile.
                </p>
                <div className="grid gap-3 mt-6 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep("addFamily")}
                    className="rounded-xl border border-gray-200 p-4 text-left hover:border-prime hover:bg-blue-50 transition"
                  >
                    <p className="font-semibold text-gray-900">Add family member</p>
                    <p className="text-sm text-gray-600 mt-1">Create profile for father, mother, spouse, child.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep("completeProfile")}
                    className="rounded-xl border border-gray-200 p-4 text-left hover:border-prime hover:bg-blue-50 transition"
                  >
                    <p className="font-semibold text-gray-900">Complete my profile</p>
                    <p className="text-sm text-gray-600 mt-1">Fill your own details first, add members anytime later.</p>
                  </button>
                </div>
              </>
            )}

            {setupStep === "addFamily" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Add Family Member</h2>
                <p className="text-gray-600 mt-2">
                  Family member management is available in your Profile page. We’ll take you there.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep("choice")}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      completeSetup();
                      window.location.href = "/profile";
                    }}
                    className="px-4 py-2 rounded-lg bg-prime text-white"
                  >
                    Open Profile
                  </button>
                </div>
              </>
            )}

            {setupStep === "completeProfile" && (
              <>
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                <p className="text-gray-600 mt-2">
                  We’ll take you to profile page to complete your details.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupStep("choice")}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      completeSetup();
                      window.location.href = "/profile";
                    }}
                    className="px-4 py-2 rounded-lg bg-prime text-white"
                  >
                    Open Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {canUsePortal &&
        isAuthenticated &&
        pathname !== "/choose-profile" &&
        showProfilePicker &&
        profiles.length > 1 &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-[#080b12] text-white p-6">
            <div className="max-w-5xl mx-auto pt-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-center">Who’s using ZoctorAI?</h2>
              <p className="text-center text-white/70 mt-2">Choose a profile to continue</p>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => selectProfile(profile)}
                    className="group rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 hover:border-prime/70 transition"
                  >
                    <div
                      className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${getAvatarClass(
                        profile.id || profile.name
                      )} flex items-center justify-center text-2xl font-bold shadow-lg`}
                    >
                      {(profile.name || "P").charAt(0).toUpperCase()}
                    </div>
                    <p className="mt-3 font-semibold">{profile.name}</p>
                    <p className="text-xs text-white/60 capitalize">{profile.relation}</p>
                  </button>
                ))}

                <div className="rounded-2xl border border-dashed border-white/25 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">+ Add profile</p>
                  <p className="text-xs text-white/60 mt-1">Create for family member</p>
                  <input
                    value={pickerAddName}
                    onChange={(e) => setPickerAddName(e.target.value)}
                    placeholder="Name"
                    className="mt-3 w-full rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 text-sm text-white placeholder:text-white/50"
                  />
                  <select
                    value={pickerAddRelation}
                    onChange={(e) => setPickerAddRelation(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 text-sm text-white"
                  >
                    <option value="spouse" className="text-black">Spouse</option>
                    <option value="parent" className="text-black">Parent</option>
                    <option value="child" className="text-black">Child</option>
                    <option value="sibling" className="text-black">Sibling</option>
                    <option value="other" className="text-black">Other</option>
                  </select>
                  {pickerAddError && <p className="text-[11px] text-red-300 mt-2">{pickerAddError}</p>}
                  <button
                    type="button"
                    onClick={handlePickerAddProfile}
                    className="mt-3 w-full rounded-lg bg-prime py-2 text-sm font-semibold hover:bg-blue-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              <p className="mt-8 text-center text-xs text-white/55">
                Select a profile to continue.
              </p>
            </div>
          </div>,
          document.body
        )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;