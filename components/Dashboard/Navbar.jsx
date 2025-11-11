"use client";
import React, { useState, useEffect } from 'react';
import { FaUser, FaUserCircle } from 'react-icons/fa';
import { MdLogout, MdSettings } from 'react-icons/md';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../AuthProvider';
import { BsTelegram } from "react-icons/bs";
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

const Navbar = () => { 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const { userId } = useParams();
  // We'll store the user's first name in local state
  const [firstName, setFirstName] = useState("");

  // On mount or when isAuthenticated changes, load from localStorage (or an API)
  useEffect(() => {
    if (isAuthenticated) {
      const storedName = localStorage.getItem("firstName") || "";
      setFirstName(storedName);
    } else {
      setFirstName("");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // This function clears user data from localStorage and redirects to login
  const handleLogout = async () => {
    try {
      setDropdownOpen(false); // Close dropdown before logout
      await logout();
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
      router.push("/login");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="bg-[#0e0e0e] text-white p-4 flex justify-end gap-4 items-center">

      <div className="flex gap-2 text-[25px]">
              <a
                target="_blank"
                href="https://www.instagram.com/"
                className="hover:text-prime transition-all duration-200"
              >
                <FaInstagram />
              </a>

              <a
                target="_blank"
                href="https://twitter.com/"
                className="hover:text-prime transition-all duration-200"
              >
                <FaTwitter />
              </a>

              <a
                target="_blank"
                href="#"
                className="hover:text-prime transition-all duration-200"
              >
                <BsTelegram />
              </a>

        
            </div>
      <div className="relative bg-[#484848] rounded-full py-1 px-3 shadow-md dropdown-container">
        
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 text-white focus:outline-none"
        >
          <FaUserCircle size={24} />
          <span className=' uppercase'>{firstName}</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-[#fff] border-prime border-2 text-[#000] shadow-lg rounded-md w-40 z-50">
            <a
              href={`/profile/${userId}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
             <FaUser/> Profile
            </a>
            {/* <a
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <MdSettings /> Settings
            </a> */}
            <button
            onClick={handleLogout}
      
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
            >
              <MdLogout /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
