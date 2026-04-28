"use client";
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  fetchUserInfo,
  updateUserInfo,
  isZoctorFastApiBackend,
  listFamilyProfiles,
  addFamilyProfile,
  deleteFamilyProfile,
  getFamilyProfileDetails,
  updateFamilyProfileDetails,
  fileToBase64,
} from "../../utils/api";
import { useAuth } from "../../AuthProvider";
import { CiEdit } from "react-icons/ci";
import { AiTwotoneDelete } from "react-icons/ai";
import { motion } from 'framer-motion';

// Add LoadingAnimation component
const LoadingAnimation = () => {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const circleVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  };

  return (
    <div className="flex justify-center items-center h-64">
      <motion.div
        className="flex gap-2"
        variants={containerVariants}
        initial="start"
        animate="end"
      >
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="w-4 h-4 rounded-full bg-prime"
            variants={circleVariants}
            transition={circleTransition}
          />
        ))}
      </motion.div>
      <motion.div
        className="ml-4 text-lg font-medium text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Loading Profile...
      </motion.div>
    </div>
  );
};

/** Map `/api/users/auth/me` or patch `user` object (snake_case) to profile form state */
function mapApiUserToForm(response) {
  return {
    firstName: response.first_name,
    lastName: response.last_name,
    email: response.email,
    username: response.username,
    phoneNumber: response.phone,
    description: response.description,
    preferredLanguage: response.preferred_language,
    preferredContactMethod: response.preferred_contact_methods,
    dateOfBirth: response.date_of_birth || "",
    gender: response.gender || "",
    bloodType: response.blood_type || "",
    address: response.address || {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    profilePicture:
      typeof response.profile_picture === "string"
        ? { url: response.profile_picture }
        : response.profile_picture || null,
    preferredAppointmentTime: response.preferred_appointment_time || "",
    IsthisWhatsappPhoneNumber: response.is_whatsapp_phone || false,
    willingForInternationalTreatment: response.willing_international_treatment || false,
    willingForMedicalTourism: response.willing_medical_tourism || false,
    wantZoctorAICallback: response.want_zoctor_callback || false,
    Smoking: response.smoking || false,
    alchohal: response.alcohol || false,
  };
}

const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const Profile = () => {
  const { activeProfile } = useAuth();
  // State for user data, loading status, messages, etc.
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [familyProfiles, setFamilyProfiles] = useState([]);
  const [familyLoading, setFamilyLoading] = useState(false);
  const [fmName, setFmName] = useState("");
  const [fmRelation, setFmRelation] = useState("child");
  const [fmRelationCustom, setFmRelationCustom] = useState("");
  const profilePicInputRef = useRef(null);
  const ownerUserId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";
  const activeProfileId = activeProfile?.id || (ownerUserId ? `${ownerUserId}_self` : "");
  const isSelfProfile = Boolean(ownerUserId) && activeProfileId === `${ownerUserId}_self`;

  const buildBlankProfileForm = (profile) => ({
    firstName: profile?.name || "",
    lastName: "",
    email: "",
    username: "",
    phoneNumber: "",
    description: "",
    preferredLanguage: "",
    preferredContactMethod: [],
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    profilePicture: null,
    preferredAppointmentTime: "",
    IsthisWhatsappPhoneNumber: false,
    willingForInternationalTreatment: false,
    willingForMedicalTourism: false,
    wantZoctorAICallback: false,
    Smoking: false,
    alchohal: false,
  });

  // Add this inside the Profile component, with the other state variables
  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ];

  // Fetch user info on component mount or when userId changes
  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");
        if (isSelfProfile) {
          const response = await fetchUserInfo();
          const transformedData = mapApiUserToForm(response);
          setUserData(transformedData);
        } else {
          if (!ownerUserId || !activeProfileId) {
            setUserData(buildBlankProfileForm(activeProfile));
            return;
          }
          const profileRes = await getFamilyProfileDetails(ownerUserId, activeProfileId).catch(() => null);
          const p = profileRes?.profile;
          if (p) {
            setUserData(
              mapApiUserToForm({
                email: "",
                username: "",
                first_name: p.first_name || (p.name || "").split(" ").slice(0, 1).join(""),
                last_name: p.last_name || (p.name || "").split(" ").slice(1).join(" "),
                phone: p.phone,
                description: p.description,
                preferred_language: p.preferred_language,
                preferred_contact_methods: p.preferred_contact_methods || [],
                date_of_birth: p.date_of_birth,
                gender: p.gender,
                blood_type: p.blood_type,
                address: p.address,
                preferred_appointment_time: p.preferred_appointment_time,
                is_whatsapp_phone: p.is_whatsapp_phone,
                willing_international_treatment: p.willing_international_treatment,
                willing_medical_tourism: p.willing_medical_tourism,
                want_zoctor_callback: p.want_zoctor_callback,
                smoking: p.smoking,
                alcohol: p.alcohol,
                profile_picture: p.profile_picture,
              })
            );
          } else {
            setUserData(buildBlankProfileForm(activeProfile));
          }
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        const errorMsg = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.msg || 
                        error.message || 
                        "Unknown error";
        setErrorMessage(`Failed to load user information: ${errorMsg}`);
        
        // If 401, redirect to login
        if (error.response?.status === 401) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch user data regardless of userId from route
    // The API endpoint /api/users/auth/me uses the authenticated user's token
    getUserData();
  }, [userId, isSelfProfile, ownerUserId, activeProfileId, activeProfile]); // Keep userId in deps in case we need to refetch for specific user later

  useEffect(() => {
    if (!isZoctorFastApiBackend() || typeof window === "undefined") return;
    const uid = localStorage.getItem("userId");
    if (!uid || !userData) return;
    let cancelled = false;
    (async () => {
      try {
        setFamilyLoading(true);
        const r = await listFamilyProfiles(uid);
        if (!cancelled) setFamilyProfiles(r.profiles || []);
      } catch (e) {
        console.error("Family profiles:", e);
      } finally {
        if (!cancelled) setFamilyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userData]);

  const handleAddFamily = async (e) => {
    e.preventDefault();
    if (!fmName.trim()) return;
    const finalRelation =
      fmRelation === "other"
        ? (fmRelationCustom || "").trim().toLowerCase()
        : fmRelation;
    if (!finalRelation) {
      setErrorMessage("Please enter relation name when selecting Other.");
      return;
    }
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    try {
      setErrorMessage("");
      await addFamilyProfile(uid, { name: fmName.trim(), relation: finalRelation });
      setFmName("");
      setFmRelation("child");
      setFmRelationCustom("");
      const r = await listFamilyProfiles(uid);
      setFamilyProfiles(r.profiles || []);
      setSuccessMessage("Family member added.");
    } catch (err) {
      setErrorMessage(err.message || "Could not add family member.");
    }
  };

  const handleDeleteFamily = async (profileId) => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    if (!window.confirm("Remove this profile?")) return;
    try {
      await deleteFamilyProfile(uid, profileId);
      const r = await listFamilyProfiles(uid);
      setFamilyProfiles(r.profiles || []);
      setSuccessMessage("Profile removed.");
    } catch (err) {
      setErrorMessage(err.message || "Could not remove profile.");
    }
  };

  // Handle form changes (handles nested 'address' separately)
  const handleChange = (field, value) => {
    if (field === "address") {
      setUserData((prevState) => ({
        ...prevState,
        address: { ...prevState.address, ...value },
      }));
    } else {
      setUserData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  // Submit the update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setIsLoading(true);
      // Format the time data
      const userUpdates = {
        ...userData,
        preferredAppointmentTime:
          userData.customPreferredTime || userData.preferredAppointmentTime,
      };
      // Exclude restricted fields
      const {
        email,
        username,
        password,
        verificationToken,
        customPreferredTime,
        ...finalUpdates
      } = userUpdates;

      // Transform frontend data to API format
      const apiData = {
        first_name: finalUpdates.firstName,
        last_name: finalUpdates.lastName,
        phone: finalUpdates.phoneNumber,
        description: finalUpdates.description,
        preferred_language: finalUpdates.preferredLanguage,
        preferred_contact_methods: finalUpdates.preferredContactMethod,
        date_of_birth: finalUpdates.dateOfBirth,
        gender: finalUpdates.gender,
        blood_type: finalUpdates.bloodType,
        address: finalUpdates.address,
        preferred_appointment_time: finalUpdates.preferredAppointmentTime,
        is_whatsapp_phone: finalUpdates.IsthisWhatsappPhoneNumber,
        willing_international_treatment: finalUpdates.willingForInternationalTreatment,
        willing_medical_tourism: finalUpdates.willingForMedicalTourism,
        want_zoctor_callback: finalUpdates.wantZoctorAICallback,
        smoking: finalUpdates.Smoking,
        alcohol: finalUpdates.alchohal
      };

      if (isSelfProfile) {
        const response = await updateUserInfo(null, apiData);
        setSuccessMessage(response.msg || response.message || "Profile updated successfully!");
      } else {
        if (ownerUserId && activeProfileId) {
          await updateFamilyProfileDetails(ownerUserId, activeProfileId, apiData);
        }
        setSuccessMessage("Profile updated successfully!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.msg || 
                      error.message || 
                      "An error occurred while updating the user.";
      setErrorMessage(errorMsg);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for nested values
  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  };

  // List of required fields for profile completion (added Smoking and alchohal)
  const requiredFields = [
    "firstName",
    "lastName",
    "phoneNumber",
    "description",
    "preferredLanguage",
    "preferredContactMethod",
    "dateOfBirth",
    "gender",
    "bloodType",
    "address.street",
    "address.city",
    "address.state",
    "address.zipCode",
    "address.country",
    "profilePicture",
    "preferredAppointmentTime",
    "IsthisWhatsappPhoneNumber",
    "willingForInternationalTreatment",
    "willingForMedicalTourism",
    "wantZoctorAICallback",
    "Smoking",
    "alchohal",
  ];

  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    let completed = 0;
    requiredFields.forEach((field) => {
      const value = getNestedValue(userData, field);
      if (Array.isArray(value)) {
        if (value.length > 0) completed++;
      } else if (typeof value === "boolean") {
        // For booleans, count as complete if defined (even if false)
        if (value !== undefined) completed++;
      } else if (value) {
        completed++;
      }
    });
    return Math.round((completed / requiredFields.length) * 100);
  };

  // Handle profile picture upload (data URL stored via PATCH /api/users/auth/update)
  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!localStorage.getItem("accessToken")) {
      setErrorMessage("Please log in to upload a profile picture.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please choose an image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setErrorMessage("Image must be 2MB or smaller.");
      return;
    }
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const b64 = await fileToBase64(file);
      const mime = file.type || "image/jpeg";
      const dataUrl = `data:${mime};base64,${b64}`;
      if (isSelfProfile) {
        const response = await updateUserInfo(null, {
          profile_picture: { url: dataUrl },
        });
        if (response.user) {
          setUserData((prev) => ({
            ...mapApiUserToForm(response.user),
            customPreferredTime: prev?.customPreferredTime,
          }));
        } else {
          setUserData((prev) => ({
            ...prev,
            profilePicture: { url: dataUrl },
          }));
        }
        setSuccessMessage(
          response.msg || response.message || "Profile picture updated."
        );
      } else {
        setUserData((prev) => ({
          ...prev,
          profilePicture: { url: dataUrl },
        }));
        if (ownerUserId && activeProfileId) {
          await updateFamilyProfileDetails(ownerUserId, activeProfileId, {
            profile_picture: { url: dataUrl },
          });
        }
        setSuccessMessage("Profile picture updated.");
      }
      if (profilePicInputRef.current) profilePicInputRef.current.value = "";
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.detail ||
        error.msg ||
        error.message;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to upload profile picture. Try again or use a smaller image."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePic = async () => {
    if (!localStorage.getItem("accessToken")) {
      setErrorMessage("Please log in to change your profile picture.");
      return;
    }
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (isSelfProfile) {
        const response = await updateUserInfo(null, { profile_picture: null });
        if (response.user) {
          setUserData((prev) => ({
            ...mapApiUserToForm(response.user),
            customPreferredTime: prev?.customPreferredTime,
          }));
        } else {
          setUserData((prev) => ({ ...prev, profilePicture: null }));
        }
        setSuccessMessage(
          response.msg || response.message || "Profile picture removed."
        );
      } else {
        setUserData((prev) => ({ ...prev, profilePicture: null }));
        if (ownerUserId && activeProfileId) {
          await updateFamilyProfileDetails(ownerUserId, activeProfileId, {
            profile_picture: null,
          });
        }
        setSuccessMessage("Profile picture removed.");
      }
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.detail ||
        error.msg ||
        error.message;
      setErrorMessage(
        typeof detail === "string"
          ? detail
          : "Failed to remove profile picture."
      );
    } finally {
      setUploading(false);
    }
  };

  console.log("Profile render state:", { isLoading, userData: !!userData, errorMessage });
  if (isLoading) return <LoadingAnimation />;
  if (!userData && !errorMessage) {
    console.log("Returning null - no userData and no errorMessage");
    return <div>Loading profile data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with Save Button */}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#707070]">Profile </h1>
        {userData && (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-prime hover:bg-blue-600 text-[#fff] px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Profile Completion Progress */}
      {calculateProfileCompletion() < 100 && (
        <div className="mb-6 max-w-4xl mx-auto">
          <p className="text-xs font-medium text-[#707070]">
            Profile Completion: {calculateProfileCompletion()}%
          </p>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-prime h-2 rounded-full"
              style={{ width: `${calculateProfileCompletion()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Success & Error Messages */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {isZoctorFastApiBackend() && userData && (
        <div className="max-w-4xl mx-auto mb-8 p-6 bg-white rounded-2xl border border-[#a0a0a07c] shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Family profiles</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage dependents for paid reports and Vitality Track (same fields as your signup preferences).
          </p>
          {familyLoading ? (
            <p className="text-gray-500">Loading profiles…</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {(familyProfiles || []).map((p) => (
                <li
                  key={p.profile_id || p.id}
                  className="flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50"
                >
                  <span className="text-gray-800">
                    <strong>{p.name}</strong>
                    <span className="text-gray-500 text-sm ml-2">({p.relation})</span>
                  </span>
                  {p.relation !== "self" && !(String(p.profile_id || p.id).endsWith("_self")) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFamily(p.profile_id || p.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleAddFamily} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                value={fmName}
                onChange={(e) => setFmName(e.target.value)}
                className="px-3 py-2 border rounded-lg"
                placeholder="Family member name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Relation</label>
              <select
                value={fmRelation}
                onChange={(e) => setFmRelation(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="spouse">Spouse</option>
                <option value="wife">Wife</option>
                <option value="husband">Husband</option>
                <option value="child">Child</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="parent">Parent</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="sibling">Sibling</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="other">Other</option>
              </select>
            </div>
            {fmRelation === "other" && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom relation</label>
                <input
                  value={fmRelationCustom}
                  onChange={(e) => setFmRelationCustom(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                  placeholder="e.g. uncle, aunt, guardian"
                />
              </div>
            )}
            <button type="submit" className="bg-prime text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Add member
            </button>
          </form>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-gray-100 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className=" p-1 w-full max-w-4xl"
        >
          <div className=" border border-[#a0a0a07c] flex flex-col justify-normal gap-12 items-center md:flex-row  py-3 px-4 shadow-xl rounded-2xl">
            <div>
              <img
                src={userData?.profilePicture?.url || "/images/avatar.png"}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full border-2 border-prime shadow-lg"
              />
              <div className="-mt-3 flex justify-center  gap-2 items-center">
                <label
                  htmlFor="profilePic"
                  className="cursor-pointer bg-[#ffffff] rounded-md py-1 px-2 border border-[#6d6d6d]"
                >
                  {uploading ? "Uploading..." : <CiEdit />}
                </label>
                <input
                  ref={profilePicInputRef}
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="hidden"
                />
                {userData?.profilePicture && userData.profilePicture.url && (
                  <button
                    type="button"
                    onClick={handleRemoveProfilePic}
                    className=" cursor-pointer bg-[#ffffff] rounded-md py-1 px-2 border border-[#6d6d6d]"
                  >
                    <AiTwotoneDelete />
                  </button>
                )}
              </div>
            </div>
            <div>
              <h2 className=" -mt-4 text-xl font-semibold uppercase text-gray-800">
                Name: {userData?.firstName}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <p className="text-gray-500">
                  Gender: {userData?.gender || "Not specified"}
                </p>{" "}
                |
                <p className="text-gray-400 text-sm">
                  DOB:{" "}
                  {userData?.dateOfBirth
                    ? userData.dateOfBirth.split("T")[0]
                    : "DOB not set"}
                </p>
              </div>
            </div>
          </div>
          <div className="">
            {/* Left Section - Avatar & Basic Info */}

            {/* Right Section - Details */}
            <div className="w-full ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 px-4 border border-[#a0a0a07c] shadow-xl mt-4 rounded-2xl bg-[#fff]">
                {/* Basic Personal Info */}
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={userData?.firstName || ""}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={userData?.lastName || ""}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={userData?.phoneNumber || ""}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">Email</label>
                  <input
                    type="text"
                    value={userData?.email}
                    disabled
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent bg-gray-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-medium text-[#707070]">
                    Description
                  </label>
                  <textarea
                    value={userData?.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">
                    Preferred Language
                  </label>
                  <select
                    value={userData?.preferredLanguage || ""}
                    onChange={(e) =>
                      handleChange("preferredLanguage", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  >
                    <option value="">Select Language</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Chinese">Chinese (Mandarin)</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Portuguese">Portuguese</option>
                    <option value="Russian">Russian</option>
                    <option value="Japanese">Japanese</option>
                    <option value="German">German</option>
                    <option value="Korean">Korean</option>
                    <option value="Italian">Italian</option>
                    <option value="Turkish">Turkish</option>
                    <option value="Vietnamese">Vietnamese</option>
                  </select>
                </div>
                {/* Blood Type */}
                <div className="space-y-2">
                  <label className="font-medium text-[#707070]">
                    Blood Type
                  </label>
                  <select
                    value={userData?.bloodType || ""}
                    onChange={(e) => handleChange("bloodType", e.target.value)}
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-medium text-[#707070]">
                    Contact Methods
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {["email", "phone", "sms"].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`contact-${method}`}
                          checked={userData?.preferredContactMethod?.includes(
                            method
                          )}
                          onChange={(e) => {
                            const newContactMethods = [
                              ...(userData?.preferredContactMethod || []),
                            ];
                            if (e.target.checked) {
                              newContactMethods.push(method);
                            } else {
                              const index = newContactMethods.indexOf(method);
                              if (index > -1) {
                                newContactMethods.splice(index, 1);
                              }
                            }
                            handleChange(
                              "preferredContactMethod",
                              newContactMethods
                            );
                          }}
                          className="w-4 h-4 text-prime border rounded focus:ring"
                        />
                        <label
                          htmlFor={`contact-${method}`}
                          className="text-[#707070]"
                        >
                          {method.toUpperCase()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


    {/* Additional Information Section */}
    <div className="mt-6 border border-[#a0a0a07c] rounded-2xl shadow-xl bg-[#fff] px-4  py-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Additional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <label className="font-medium text-[#707070]">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={
                        userData?.dateOfBirth
                          ? userData.dateOfBirth.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("dateOfBirth", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                    />
                  </div>
                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="font-medium text-[#707070]">Gender</label>
                    <select
                      value={userData?.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Profile Picture URL */}

                  {/* Address */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-medium text-[#707070]">
                          Street
                        </label>
                        <input
                          type="text"
                          value={userData?.address?.street || ""}
                          onChange={(e) =>
                            handleChange("address", { street: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-medium text-[#707070]">
                          City
                        </label>
                        <input
                          type="text"
                          value={userData?.address?.city || ""}
                          onChange={(e) =>
                            handleChange("address", { city: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-medium text-[#707070]">
                          State
                        </label>
                        <input
                          type="text"
                          value={userData?.address?.state || ""}
                          onChange={(e) =>
                            handleChange("address", { state: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-medium text-[#707070]">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          value={userData?.address?.zipCode || ""}
                          onChange={(e) =>
                            handleChange("address", { zipCode: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-medium text-[#707070]">
                          Country
                        </label>
                        <input
                          type="text"
                          value={userData?.address?.country || ""}
                          onChange={(e) =>
                            handleChange("address", { country: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Additional Preferences Section */}
            

              {/* Lifestyle Section */}
              <div className="mt-6 py-4 border border-[#a0a0a07c] rounded-2xl shadow-xl bg-[#fff] px-4 ">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Lifestyle
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium text-[#707070] block mb-2">
                      Do you smoke?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="smoking-yes"
                          name="smoking"
                          checked={userData?.Smoking === true}
                          onChange={(e) => handleChange("Smoking", true)}
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="smoking-yes"
                          className="ml-2 text-[#707070]"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="smoking-no"
                          name="smoking"
                          checked={userData?.Smoking === false}
                          onChange={(e) => handleChange("Smoking", false)}
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="smoking-no"
                          className="ml-2 text-gray-700"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700 block mb-2">
                      Do you consume alcohol?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="alcohol-yes"
                          name="alcohol"
                          checked={userData?.alchohal === true}
                          onChange={(e) => handleChange("alchohal", true)}
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="alcohol-yes"
                          className="ml-2 text-gray-700"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="alcohol-no"
                          name="alcohol"
                          checked={userData?.alchohal === false}
                          onChange={(e) => handleChange("alchohal", false)}
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="alcohol-no"
                          className="ml-2 text-gray-700"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                              {/* Preferred Appointment Time */}
              <div className=" col-span-2 space-y-2 ">
                <label className="font-medium text-gray-700">
                  Preferred Appointment Time
                </label>
                <select
                  value={userData?.preferredAppointmentTime || ""}
                  onChange={(e) =>
                    handleChange("preferredAppointmentTime", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                >
                  <option value="">Select Preferred Time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <div className=" space-y-2">
                  <label className="font-medium text-gray-700 block mb-2">
                    Custom Time (if preferred time not listed above)
                  </label>
                  <input
                    type="time"
                    value={userData?.customPreferredTime || ""}
                    onChange={(e) =>
                      handleChange("customPreferredTime", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#a0a0a07c] rounded focus:ring focus:border-transparent"
                  />
                </div>
              </div>
                </div>
              </div>
              <div className="mt-6 py-4 border border-[#a0a0a07c] rounded-2xl shadow-xl bg-[#fff] px-4 ">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Additional Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="font-medium text-[#707070] block mb-2">
                      Is this a WhatsApp number?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="whatsapp-yes"
                          name="whatsapp"
                          checked={userData?.IsthisWhatsappPhoneNumber === true}
                          onChange={(e) =>
                            handleChange("IsthisWhatsappPhoneNumber", true)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="whatsapp-yes"
                          className="ml-2 text-gray-700"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="whatsapp-no"
                          name="whatsapp"
                          checked={
                            userData?.IsthisWhatsappPhoneNumber === false
                          }
                          onChange={(e) =>
                            handleChange("IsthisWhatsappPhoneNumber", false)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="whatsapp-no"
                          className="ml-2 text-gray-700"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-[#707070] block mb-2">
                      Consider international treatment?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="international-yes"
                          name="international"
                          checked={
                            userData?.willingForInternationalTreatment === true
                          }
                          onChange={(e) =>
                            handleChange(
                              "willingForInternationalTreatment",
                              true
                            )
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="international-yes"
                          className="ml-2 text-[#707070]"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="international-no"
                          name="international"
                          checked={
                            userData?.willingForInternationalTreatment === false
                          }
                          onChange={(e) =>
                            handleChange(
                              "willingForInternationalTreatment",
                              false
                            )
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="international-no"
                          className="ml-2 text-[#707070]"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-[#707070] block mb-2">
                      Interested in medical tourism?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="tourism-yes"
                          name="tourism"
                          checked={userData?.willingForMedicalTourism === true}
                          onChange={(e) =>
                            handleChange("willingForMedicalTourism", true)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="tourism-yes"
                          className="ml-2 text-[#707070]"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="tourism-no"
                          name="tourism"
                          checked={userData?.willingForMedicalTourism === false}
                          onChange={(e) =>
                            handleChange("willingForMedicalTourism", false)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="tourism-no"
                          className="ml-2 text-gray-700"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-medium text-[#707070] block mb-2">
                      Want ZoctorAI callback?
                    </label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="callback-yes"
                          name="callback"
                          checked={userData?.wantZoctorAICallback === true}
                          onChange={(e) =>
                            handleChange("wantZoctorAICallback", true)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="callback-yes"
                          className="ml-2 text-[#707070]"
                        >
                          Yes
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="callback-no"
                          name="callback"
                          checked={userData?.wantZoctorAICallback === false}
                          onChange={(e) =>
                            handleChange("wantZoctorAICallback", false)
                          }
                          className="w-4 h-4 text-prime border-gray-300 focus:ring-prime"
                        />
                        <label
                          htmlFor="callback-no"
                          className="ml-2 text-[#707070]"
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          
            </div>
          </div>
          <div className="flex justify-center items-center my-6">
     
        {userData && (
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-prime hover:bg-blue-600 text-[#fff] px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {isLoading ? "Updating..." : "Save Changes"}
          </button>
        )}
      </div>
        </form>

      </div>
    </div>
  );
};

export default Profile;
