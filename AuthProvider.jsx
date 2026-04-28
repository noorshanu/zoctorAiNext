"use client";
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [showFirstRunSetup, setShowFirstRunSetup] = useState(false);
  const [setupStep, setSetupStep] = useState("choice"); // choice | addFamily | completeProfile
  const [setupFamilyName, setSetupFamilyName] = useState("");
  const [setupFamilyRelation, setSetupFamilyRelation] = useState("spouse");
  const [setupError, setSetupError] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(false);
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
      setShowFirstRunSetup(false);
    }
  };

  const selectProfile = (profile) => {
    const uid = localStorage.getItem('userId');
    if (!uid || !profile?.id) return;
    setActiveProfile(profile);
    localStorage.setItem(profileStorageKey(uid), profile.id);
    localStorage.removeItem(postLoginUiKey(uid));
  };

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

      
    </AuthContext.Provider>
  );
};

export default AuthProvider;