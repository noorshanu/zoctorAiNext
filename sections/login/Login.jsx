/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "../../utils/api";
import { useAuth } from '../../AuthProvider';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ identifier: email, password });

      if (!response.status) {
        setError(response.message || "Login failed");
        return;
      }

      // Store token in localStorage
      localStorage.setItem('accessToken', response.accessToken);
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
      setError(err.msg || "Login failed");
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
              {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
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