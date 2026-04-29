"use client";
import { useState } from "react";
import { requestForgotPasswordOtp, resetPasswordWithOtp } from "../utils/api";

import NavbarLight from "../components/NavbarLight";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await requestForgotPasswordOtp(email);
      setSessionId(response?.session_id || "");
      setMessage(response?.message || "OTP sent to your email.");
    } catch (err) {
      setError(err?.message || err?.detail || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const response = await resetPasswordWithOtp(sessionId, otp, newPassword);
      setMessage(response?.message || "Password updated successfully.");
      setEmail("");
      setSessionId("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.message || err?.detail || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div>
 <NavbarLight/>
 <main className="bg-[#fff]">
 <div className="container mx-auto px-4 py-6 h-screen pt-[10%]">
      <h1 className="text-2xl font-bold mb-4 text-center text-prime">Forgot Password</h1>
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {!sessionId ? (
      <form onSubmit={handleSendOtp} className="max-w-md mx-auto bg-[#252525] p-4 rounded-lg border border-prime ">
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-[#000]"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-prime text-white px-4 py-2 rounded"
        >
          {loading ? "Sending..." : "Send 4-digit OTP"}
        </button>
      </form>
      ) : (
      <form onSubmit={handleReset} className="max-w-md mx-auto bg-[#252525] p-4 rounded-lg border border-prime space-y-3">
        <div>
          <label className="block text-gray-700">4-digit OTP</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            placeholder="1234"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || otp.length !== 4}
          className="bg-prime text-white px-4 py-2 rounded"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      )}
    </div>
 </main>
 <Footer/>
   </div>
  );
};

export default ForgotPassword;