"use client";
import { useState } from "react";
import { registerUser } from "../../utils/api";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { IoEye } from "react-icons/io5";
import { IoIosEyeOff } from "react-icons/io";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
    firstName: "",
    lastName: "",

    phoneNumber: "",
    description: "",

    preferredLanguage: "English",
    preferredContact: [],
  });

  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "preferredContact") {
      const updatedContacts = checked
        ? [...formData.preferredContact, value]
        : formData.preferredContact.filter((contact) => contact !== value);

      setFormData({ ...formData, preferredContact: updatedContacts });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    if (name === "password") {
      const strength =
        value.length > 8 ? "Strong" : value.length > 5 ? "Medium" : "Weak";
      setPasswordStrength(strength);
    }
  };
  const handlePhoneNumberChange = (phoneNumber) => {
    setFormData({ ...formData, phoneNumber });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (formData.password !== formData.confirmpassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmpassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
        description: formData.description,
        preferred_contact_methods: formData.preferredContact,
        preferred_language: formData.preferredLanguage
      });
      console.log("Payload to be sent:", {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmpassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
        description: formData.description,
        preferred_contact_methods: formData.preferredContact,
        preferred_language: formData.preferredLanguage
      });
      console.log("Signup mapped response:", response);
      if (response.sessionId) {
        // store session for later OTP verification flows
        sessionStorage.setItem('signup_session_id', response.sessionId);
        sessionStorage.setItem('signup_session_ttl', String(response.ttlSeconds ?? ''));
      }

      if (response.status) {
        setSuccess(response.message);
        setIsRegistered(true);
      } else {
        // Handle specific error messages

        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      // Fallback error handling

      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 mt-[5%] w-full max-w-full sm:max-w-3xl mx-auto">
      {!isRegistered ? (
        <div className="bg-[#000000cc] border-prime border rounded-lg shadow-lg py-4 px-6   no-transition w-full mx-auto">
          <h1 className="text-2xl font-semibold mb-4 border-b-2 pb-2 border-[#0062f1]">
            Registration{" "}
          </h1>
          <form
            className=" shadow-md rounded-md p-6 max-w-2xl w-full text-black"
            onSubmit={handleSubmit}
          >
            {/* Error/Success Messages */}
            {error && (
              <p
                className={`${error === "Passwords do not match" ? "text-yellow-600" : "text-red-500"} mb-4`}
              >
                {error}
              </p>
            )}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            {isLoading && <p className="text-blue-500 mb-4">Processing...</p>}

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Jhon"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                required
                placeholder="jhonedoe1234"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            {/* Phone Number Field */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">Phone Number</label>
              <PhoneInput
                defaultCountry="US"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                className="w-full p-3 mt-1 border rounded-lg bg-[#fff] focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                required
                placeholder="example@mail.com"
                onChange={handleInputChange}
                value={formData.email}
              />
            </div>

            {/* Password Fields in Two Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full p-3 pr-12 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="***********"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? <IoIosEyeOff size={22} className="text-prime" /> : <IoEye size={22} className="text-prime" />}
                  </button>
                </div>
                <p className="text-sm mt-1 text-white">
                  Password Strength:{" "}
                  <span className="font-medium">{passwordStrength}</span>
                </p>
              </div>
              <div>
                <label className="block text-white font-medium mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmpassword"
                    className="w-full p-3 pr-12 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="************"
                    value={formData.confirmpassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-800"
                  >
                    {showConfirmPassword ? <IoIosEyeOff size={22} className="text-prime" /> : <IoEye size={22} className="text-prime" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Appointment Preferences */}
            <h2 className="text-xl font-semibold mt-6 mb-4 text-white">
              Appointment Preferences
            </h2>
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">
                Preferred Language
              </label>
              <select
                name="preferredLanguage"
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                value={formData.preferredLanguage}
                onChange={handleInputChange}
              >
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Hindi">Hindi</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Italian">Italian</option>
                <option value="Turkish">Turkish</option>
                <option value="Swahili">Swahili</option>
                <option value="Urdu">Urdu</option>
                <option value="Bengali">Bengali</option>
                <option value="Tamil">Tamil</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Malay">Malay</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Persian">Persian</option>
                <option value="Dutch">Dutch</option>
                <option value="Greek">Greek</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">
                Preferred Contact Method
              </label>
              <div className="flex gap-4">
                <label className="text-white">
                  <input
                    type="checkbox"
                    name="preferredContact"
                    value="phone"
                    className="mr-2 text-white"
                    checked={formData.preferredContact.includes("phone")}
                    onChange={handleInputChange}
                  />
                  Phone Call
                </label>
                <label className="text-white">
                  <input
                    type="checkbox"
                    name="preferredContact"
                    value="sms"
                    className="mr-2 text-white"
                    checked={formData.preferredContact.includes("sms")}
                    onChange={handleInputChange}
                  />
                  SMS
                </label>
                <label className="text-white">
                  <input
                    type="checkbox"
                    name="preferredContact"
                    value="email"
                    className="mr-2 text-white"
                    checked={formData.preferredContact.includes("email")}
                    onChange={handleInputChange}
                  />
                  Email
                </label>
              </div>
            </div>
            {/* Description Field */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-1">Description</label>
              <textarea
                name="description"
                className="border text-[#000] rounded w-full px-3 py-2 bg-[#fff]"
                rows={4}
                placeholder="Tell us something about yourself..."
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="text-white" >
                <input
                  type="checkbox"
                  name="termsConsent"
                  required
                  className="mr-2 text-white"
                />
                I agree to the{" "}
                <a href="/terms" className="text-blue-600 underline">
                  Terms & Conditions
                </a>
              </label>
            </div>
            <div className="mb-4">
              <label className="text-white">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  required
                  className="mr-2 text-white"
                />
                I agree to the{" "}
                <a href="/privacy" className="text-blue-600 underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Save"}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-md p-6 max-w-2xl w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-[#000]">
            Registration Successful!
          </h2>
          <p className="mb-6 text-[#000]">
            Please check your email to verify your account.
          </p>
          <a
            href="/login"
            className="bg-[#fff] border-[#000] border text-[#000] text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Login
          </a>
        </div>
      )}
    </div>
  );
};

export default SignUp;
