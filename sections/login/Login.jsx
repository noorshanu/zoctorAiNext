/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, sendOtp, verifyOtp } from "../../utils/api";
import { useAuth } from '../../AuthProvider';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    try {
      const response = await loginUser({ identifier: email, password });

      if (!response.status) {
        setError(response.message || "Login failed");
        return;
      }

      // Store token in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      localStorage.setItem('userId', response.userId);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Use the AuthContext login function
      login(response.accessToken, {
        userId: response.userId,
        firstName: response.firstName
      });

      // Navigate to the user's profile page
      router.push(`/dashboard`);
    } catch (err) {
      const detail = err?.detail || err?.message || err?.msg;
      if (typeof detail === "string" && detail.toLowerCase().includes("verify your account via otp")) {
        setOtpRequired(true);
        setError("");
        setInfo("Verification required. An OTP will be sent to your email.");
        try {
          const r = await sendOtp({ identifier: email });
          if (r?.session_id) {
            setSessionId(r.session_id);
          }
          if (r?.ttl_seconds) {
            sessionStorage.setItem('otp_ttl', String(r.ttl_seconds));
          }
          setInfo("OTP sent to your email. Please enter it below.");
        } catch (sendErr) {
          setError(sendErr?.detail || sendErr?.message || "Failed to send OTP. Try again.");
        }
      } else {
        setError(detail || "Login failed");
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const verifyResponse = await verifyOtp({ session_id: sessionId, code: otp });
      // verify-otp returns tokens and user per docs
      const access = verifyResponse?.access;
      const refresh = verifyResponse?.refresh;
      const user = verifyResponse?.user;
      if (access) localStorage.setItem('accessToken', access);
      if (refresh) localStorage.setItem('refreshToken', refresh);
      if (user?.id) localStorage.setItem('userId', String(user.id));
      if (user) localStorage.setItem('user', JSON.stringify(user));
      login(access, {
        userId: user?.id,
        firstName: user?.first_name
      });
      router.push(`/dashboard`);
    } catch (verifyErr) {
      setError(verifyErr?.detail || verifyErr?.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <>
      <div className="flex h-screen container-wrapper relative z-20">
        {/* Illustration Section */}
        <div className="hidden lg:flex items-center justify-center flex-1 bg-white text-black">
          <div className="max-w-md text-center ">
            <img src="/images/login.webp" alt="" className=" rounded-lg shadow-lg border " />
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex items-center justify-center flex-1 bg-gray-10 relative z-30">
          <div className="w-full max-w-md p-8 space-y-6 bg-[#000000cc] border-prime border rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center text-white">
              Welcome Back
            </h2>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium font-sf text-white"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-sf font-medium text-white"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600"
              >
                Login
              </button>
              {info && <p className="text-green-500 text-center mt-2">{info}</p>}
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
            {otpRequired && (
              <form className="space-y-4 mt-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-sf font-medium text-white"
                  >
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    className="w-full p-3 mt-1 border rounded-lg focus:outline-none text-[#000] focus:ring-2 focus:ring-blue-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    className="w-full p-3 text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                    onClick={async () => {
                      setError("");
                      setInfo("Resending OTP...");
                      try {
                        await sendOtp({ identifier: email });
                        setInfo("OTP resent. Check your email.");
                      } catch (sendErr) {
                        setError(sendErr?.detail || sendErr?.message || "Failed to resend OTP.");
                        setInfo("");
                      }
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
            <Link href="/forgot-password">
              <p className="text-sm text-center text-white mt-2">
                Forgot Password?
              </p>
            </Link>
            <p className="text-sm text-center text-white">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;