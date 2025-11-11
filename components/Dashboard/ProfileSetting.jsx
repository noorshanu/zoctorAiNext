"use client";
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserInfo, updateUserInfo } from "../../utils/api";
import axios from "axios";
import { CiEdit } from "react-icons/ci";
import { AiTwotoneDelete } from "react-icons/ai";
import { motion } from 'framer-motion';

const API_BASE_URL = "http://localhost:8000";

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

const Profile = () => {
  // State for user data, loading status, messages, etc.
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        const response = await fetchUserInfo();
        console.log("Profile data received:", response);
        
        // Transform API response to match frontend expectations
        const transformedData = {
          firstName: response.first_name,
          lastName: response.last_name,
          email: response.email,
          username: response.username,
          phoneNumber: response.phone,
          description: response.description,
          preferredLanguage: response.preferred_language,
          preferredContactMethod: response.preferred_contact_methods,
          // Add default values for missing fields
          dateOfBirth: response.date_of_birth || "",
          gender: response.gender || "",
          bloodType: response.blood_type || "",
          address: response.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: ""
          },
          profilePicture: response.profile_picture || null,
          preferredAppointmentTime: response.preferred_appointment_time || "",
          IsthisWhatsappPhoneNumber: response.is_whatsapp_phone || false,
          willingForInternationalTreatment: response.willing_international_treatment || false,
          willingForMedicalTourism: response.willing_medical_tourism || false,
          wantZoctorAICallback: response.want_zoctor_callback || false,
          Smoking: response.smoking || false,
          alchohal: response.alcohol || false
        };
        
        console.log("Transformed data:", transformedData);
        setUserData(transformedData);
      } catch (error) {
        console.error("Error loading user info:", error);
        setErrorMessage("Failed to load user information. " + (error.msg || error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) getUserData();
  }, [userId]);

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

      const response = await updateUserInfo(null, apiData);
      setSuccessMessage(response.msg || "Profile updated successfully!");
    } catch (error) {
      setErrorMessage(
        error.msg || "An error occurred while updating the user."
      );
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

  // Handle profile picture upload
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Get token from localStorage
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Profile picture upload not implemented in backend yet
      setSuccessMessage("Profile picture upload feature coming soon!");
      
      // TODO: Implement profile picture upload in backend
      // const response = await axios.post(
      //   `${API_BASE_URL}/api/auth/profile-picture`,
      //   formData,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );

      // // Update profile picture in state
      // setUserData((prev) => ({
      //   ...prev,
      //   profilePicture: response.data.data.profilePicture,
      // }));
      // setSuccessMessage(
      //   response.data.msg || "Profile picture uploaded successfully!"
      // );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.msg ||
          error.message ||
          "Failed to upload profile picture. Please try logging in again."
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle profile picture removal
  const handleRemoveProfilePic = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Profile picture removal not implemented in backend yet
      setSuccessMessage("Profile picture removal feature coming soon!");
      
      // TODO: Implement profile picture removal in backend
      // const response = await axios.delete(
      //   `${API_BASE_URL}/api/auth/profile-picture`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //   },
      //   }
      // );

      // setUserData((prev) => ({ ...prev, profilePicture: null }));
      // setSuccessMessage(
      //   response.data.msg || "Profile picture removed successfully!"
      // );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.msg ||
          error.message ||
          "Failed to remove profile picture. Please try logging in again."
      );
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
