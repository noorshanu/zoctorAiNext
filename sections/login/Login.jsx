/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoEye } from "react-icons/io5";
import { IoIosEyeOff } from "react-icons/io";
import { loginUser, sendOtp, verifyOtp, isZoctorFastApiBackend } from "../../utils/api";
import { normalizeApiError } from "../../utils/apiErrors";
import { useAuth } from "../../AuthProvider";
import { AuthError, AuthInfo } from "../../components/auth/AuthFeedback";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [sessionId, setSessionId] = useState("");
  const router = useRouter();
  const fastApi = isZoctorFastApiBackend();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      const response = await loginUser({ identifier: email.trim(), password });

      if (!response.status) {
        setError(response.message || "Login failed");
        return;
      }

      localStorage.setItem("accessToken", response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("userId", response.userId);
      localStorage.setItem("user", JSON.stringify(response.user));

      login(response.accessToken, {
        userId: response.userId,
        firstName: response.firstName,
      });

      router.push(`/dashboard`);
    } catch (err) {
      const { message } = normalizeApiError(err, "Login failed");

      if (
        !fastApi &&
        typeof message === "string" &&
        message.toLowerCase().includes("verify your account via otp")
      ) {
        setOtpRequired(true);
        setError("");
        setInfo("Verification required. An OTP will be sent to your email.");
        try {
          const r = await sendOtp({ identifier: email });
          if (r?.session_id) {
            setSessionId(r.session_id);
          }
          if (r?.ttl_seconds) {
            sessionStorage.setItem("otp_ttl", String(r.ttl_seconds));
          }
          setInfo("OTP sent to your email. Please enter it below.");
        } catch (sendErr) {
          const n = normalizeApiError(sendErr, "Failed to send OTP. Try again.");
          setError(n.message);
          setInfo("");
        }
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);
    try {
      const verifyResponse = await verifyOtp({ session_id: sessionId, code: otp });
      const access = verifyResponse?.access;
      const refresh = verifyResponse?.refresh;
      const user = verifyResponse?.user;
      if (access) localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);
      if (user?.id) localStorage.setItem("userId", String(user.id));
      if (user) localStorage.setItem("user", JSON.stringify(user));
      login(access, {
        userId: user?.id,
        firstName: user?.first_name,
      });
      router.push(`/dashboard`);
    } catch (verifyErr) {
      const n = normalizeApiError(verifyErr, "Invalid OTP. Please try again.");
      setError(n.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex h-screen container-wrapper relative z-20">
        <div className="hidden lg:flex items-center justify-center flex-1 bg-[#0e0e0e] text-white border-r border-white/10">
          <div className="max-w-md text-center">
            <img
              src="/images/login.webp"
              alt=""
              className="rounded-lg shadow-lg border border-white/10"
            />
          </div>
        </div>

        <div className="flex items-center justify-center flex-1 bg-[#0e0e0e] relative z-30">
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
                  autoComplete="email"
                  placeholder="example@email.com"
                  className="w-full p-3 mt-1 border border-white/20 rounded-lg bg-white text-[#000] focus:outline-none focus:ring-2 focus:ring-prime"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error && !otpRequired}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-sf font-medium text-white"
                >
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full p-3 pr-12 border border-white/20 rounded-lg bg-white text-[#000] focus:outline-none focus:ring-2 focus:ring-prime"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!error && !otpRequired}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? (
                      <IoIosEyeOff size={22} className="text-prime" />
                    ) : (
                      <IoEye size={22} className="text-prime" />
                    )}
                  </button>
                </div>
              </div>
              {info && <AuthInfo>{info}</AuthInfo>}
              {error && <AuthError>{error}</AuthError>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in…" : "Login"}
              </button>
            </form>
            {otpRequired && !fastApi && (
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
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="w-full p-3 mt-1 border border-white/20 rounded-lg bg-white text-[#000] focus:outline-none focus:ring-2 focus:ring-prime"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                {error && <AuthError>{error}</AuthError>}
                {info && <AuthInfo>{info}</AuthInfo>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full p-3 text-white bg-prime rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying…" : "Verify OTP"}
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
                        const n = normalizeApiError(sendErr, "Failed to resend OTP.");
                        setError(n.message);
                        setInfo("");
                      }
                    }}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
            <Link
              href="/forgot-password"
              className="block text-sm text-center text-white/90 hover:text-prime mt-2"
            >
              Forgot Password?
            </Link>
            <p className="text-sm text-center text-white/90">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-prime hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
