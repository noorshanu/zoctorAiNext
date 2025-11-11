"use client";
import { useState } from "react";
import axios from "axios";

import NavbarLight from "../components/NavbarLight";
import Footer from "../components/Footer";

const API_BASE_URL = "http://localhost:8000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      // Call your backend endpoint for forgot password
      const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
        email,
      });
      setMessage(response.data.msg || "Password reset link sent to your email!");
    } catch (err) {
      // Display error message from backend if available
      setError(
        err.response && err.response.data && err.response.data.msg
          ? err.response.data.msg
          : "An error occurred. Please try again."
      );
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
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#252525] p-4 rounded-lg border border-prime ">
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
 </main>
 <Footer/>
   </div>
  );
};

export default ForgotPassword;