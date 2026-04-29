"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, loginWithGoogle, verifyOtp } from "../../utils/api";
import { normalizeApiError } from "../../utils/apiErrors";
import { useAuth } from "../../AuthProvider";
import { AuthError, AuthInfo, AuthSuccess } from "../../components/auth/AuthFeedback";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { IoEye } from "react-icons/io5";
import { IoIosEyeOff } from "react-icons/io";

const SignUp = () => {
  const router = useRouter();
  const { login } = useAuth();
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");

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
    setFieldErrors({});
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
      if (response.status && response.requiresOtp && response.sessionId) {
        setOtpRequired(true);
        setOtpSessionId(response.sessionId);
        setSuccess(response.message || "OTP sent. Please verify to complete signup.");
        return;
      }

      if (response.status) {
        setSuccess(response.message);
        // FastAPI returns JWT + user on signup; persist whenever present (not only when NEXT_PUBLIC_USE_FASTAPI=1)
        if (response.accessToken && response.user) {
          localStorage.setItem("accessToken", response.accessToken);
          if (response.refreshToken) {
            localStorage.setItem("refreshToken", response.refreshToken);
          }
          localStorage.setItem("userId", String(response.user.id));
          localStorage.setItem("user", JSON.stringify(response.user));
          login(response.accessToken, {
            userId: String(response.user.id),
            firstName: response.user.first_name,
          });
          router.push("/choose-profile");
          return;
        }
        setIsRegistered(true);
      } else {
        // Handle specific error messages

        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      const { message, fieldErrors: fe } = normalizeApiError(
        err,
        "Registration failed. Please try again."
      );
      setError(message);
      setFieldErrors(fe && Object.keys(fe).length ? fe : {});
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const r = await verifyOtp({ session_id: otpSessionId, code: otpCode });
      if (!r?.access || !r?.user) {
        setError(r?.message || "Could not verify OTP.");
        return;
      }
      localStorage.setItem("accessToken", r.access);
      if (r.refresh) localStorage.setItem("refreshToken", r.refresh);
      localStorage.setItem("userId", String(r.user.id));
      localStorage.setItem("user", JSON.stringify(r.user));
      login(r.access, {
        userId: String(r.user.id),
        firstName: r.user.first_name,
      });
      router.push("/choose-profile");
    } catch (err) {
      const { message } = normalizeApiError(err, "Invalid OTP. Please try again.");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    setIsLoading(true);
    try {
      const response = await loginWithGoogle(credential);
      if (!response.status || !response.accessToken || !response.user) {
        setError(response.message || "Google sign-up failed");
        return;
      }
      localStorage.setItem("accessToken", response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("userId", String(response.user.id));
      localStorage.setItem("user", JSON.stringify(response.user));
      login(response.accessToken, {
        userId: String(response.user.id),
        firstName: response.user.first_name,
      });
      router.push("/choose-profile");
    } catch (err) {
      const { message } = normalizeApiError(err, "Google sign-up failed");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center px-4 mt-[5%] w-full max-w-full sm:max-w-3xl mx-auto pb-12">
      {!isRegistered ? (
        <div className="bg-[#000000cc] border-prime border rounded-lg shadow-lg py-4 px-6   no-transition w-full mx-auto">
          <h1 className="text-2xl font-semibold mb-4 border-b-2 pb-2 border-[#0062f1]">
            Registration{" "}
          </h1>
          <div
            className="flex flex-col items-stretch gap-2 pb-2"
            role="group"
            aria-labelledby="signup-google-heading"
          >
            <p
              id="signup-google-heading"
              className="text-center text-sm font-medium text-white/90"
            >
              Sign up with Google
            </p>
            <GoogleAuthButton
              disabled={isLoading}
              onCredential={handleGoogleCredential}
            />
          </div>
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#000000cc] px-2 text-white/70">
                or register with email
              </span>
            </div>
          </div>
          {!otpRequired ? (
          <form
            className=" shadow-md rounded-md p-6 max-w-2xl w-full text-black"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="mb-4 space-y-2">
                <AuthError>
                  {error}
                  {error === "Passwords do not match" && (
                    <span className="block text-amber-200/90 text-xs mt-1">
                      Make sure both password fields match before submitting.
                    </span>
                  )}
                </AuthError>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="text-sm text-red-200/90 list-disc list-inside space-y-1">
                    {Object.entries(fieldErrors).map(([field, msg]) => (
                      <li key={field}>
                        <span className="font-medium">{field}:</span> {msg}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {success && <AuthSuccess className="mb-4">{success}</AuthSuccess>}
            {isLoading && <AuthInfo className="mb-4">Processing…</AuthInfo>}

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
                <Link href="/terms-condition" className="text-prime hover:underline">
                  Terms & Conditions
                </Link>
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
                <Link href="/privacy-policy" className="text-prime hover:underline">
                  Privacy Policy
                </Link>
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
            <p className="text-sm text-center text-white/80 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-prime hover:underline font-medium">
                Log in
              </Link>
            </p>
          </form>
          ) : (
            <form className="p-6 max-w-md w-full mx-auto" onSubmit={handleVerifySignupOtp}>
              <label className="block text-white font-medium mb-2">Enter 4-digit OTP sent to your email</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full p-3 border rounded-lg text-black"
                placeholder="1234"
                required
              />
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 4}
                className="mt-4 w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-[#000000cc] border border-prime rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Registration Successful!
          </h2>
          <p className="mb-6 text-white/80">
            {success ||
              "You can sign in with your email and password. If your server uses email verification, check your inbox."}
          </p>
          <Link
            href="/login"
            className="inline-block bg-prime text-white py-2 px-6 rounded-lg hover:bg-blue-600 font-medium"
          >
            Go to login
          </Link>
        </div>
      )}
    </div>
  );
};

export default SignUp;
