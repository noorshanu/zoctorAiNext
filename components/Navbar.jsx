"use client";
import  { useState,useContext,useEffect } from "react";
import { Transition } from "@headlessui/react";
import { BsTwitterX, } from "react-icons/bs";
import {  FaTelegram } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthContext } from "../AuthProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from 'react-i18next';
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const isRTL = ['ar', 'ur'].includes(i18n.language);
  const { t } = useTranslation();
  const pathname = usePathname();
  const isActive = (path) => pathname === path;
  // We'll store the user's first name in local state
  const [firstName, setFirstName] = useState("");

  // On mount or when isAuthenticated changes, load from localStorage (or an API)
  useEffect(() => {
    if (isAuthenticated) {
      const storedName = localStorage.getItem("firstName") || "";
      setFirstName(storedName);
    } else {
      setFirstName("");
    }
  }, [isAuthenticated]);


  return (
    <nav className="  py-2  w-full z-40 absolute" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className=" container-wrapper mx-auto  flex justify-between items-center    pb-1 " 
      
      data-aos="fade-down"
      data-aos-offset="500"
      data-aos-duration="1000"
      data-aos-easing="ease-in-sine">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 mr-6">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <img src="images/logo.png" className="h-[90px]" alt=" Logo" />
          </a>
        </div>

        {/* Navigation menu */}
        <div className="hidden md:flex flex-grow justify-center">
          <a
            href="/"
            className={`text-white font-bold text-lg px-3 py-2 font-archo cursor-pointer border-b-2 ${isActive('/') ? 'border-prime' : 'border-transparent'}`}
          >
            {t('nav.home')}
          </a>
          <Link href="/about" className={`text-white font-bold text-lg px-3 py-2 cursor-pointer border-b-2 ${isActive('/about') ? 'border-prime' : 'border-transparent'}`}>
            {t('nav.aboutUs')}
          </Link>
          <Link 
            href="/how-it-works"
 
            className={`text-white font-bold text-lg px-3 py-2 cursor-pointer border-b-2 ${isActive('/how-it-works') ? 'border-prime' : 'border-transparent'}`}
          >
            {t('nav.howItWorks')}
          </Link>
          <Link href="/faq" className={`text-white font-bold text-lg px-3 py-2 cursor-pointer border-b-2 ${isActive('/faq') ? 'border-prime' : 'border-transparent'}`}>
            FAQ
          </Link>
          <Link href="/contactus" className={`text-white font-bold text-lg px-3 py-2 cursor-pointer border-b-2 ${isActive('/contactus') ? 'border-prime' : 'border-transparent'}`}>
            {t('nav.contactUs')}
          </Link>
        </div>

  
        <div className="flex items-center">
          <div>
            <LanguageSwitcher />
          </div>
        {isAuthenticated ? (
            /* If user is logged in, show user's first name (or "Welcome, name") */
            <div className="flex items-center gap-4 text-white ml-5">
              <p className="font-bold text-white">
                {t('nav.welcome', { name: firstName })}
              </p>
            </div>
          ) : (
            /* If user is NOT logged in, show the Login button */
            <div className="flex items-center gap-4 text-white ml-5">
              <Link
                href="/login"
                className="shadow-xl py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold bg-[#005dff] hover:bg-[#0000] hover:border flex items-center gap-2"
              >
                {t('nav.login')}
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger menu for mobile */}
        <div className="md:hidden">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} z-50 h-full w-72 bg-[#0e0e0e] border-${isRTL ? 'r' : 'l'} border-[#000] shadow-xl transform transition-transform duration-300 translate-x-0`}
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="text-white font-bold text-lg">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <nav className="px-2 py-3 space-y-1">
              <a
                href="/"
                className={`block px-3 py-2 text-white font-bold text-lg border-b-2 ${isActive('/') ? 'border-prime' : 'border-transparent'}`}
                onClick={() => setIsOpen(false)}
              >
                {t('nav.home')}
              </a>
              <Link
                href="/about"
                className={`block px-3 py-2 text-white font-bold text-lg border-b-2 ${isActive('/about') ? 'border-prime' : 'border-transparent'}`}
                onClick={() => setIsOpen(false)}
              >
                {t('nav.aboutUs')}
              </Link>
              <Link
                href="/how-it-works"
                className={`block px-3 py-2 text-white font-bold text-lg border-b-2 ${isActive('/how-it-works') ? 'border-prime' : 'border-transparent'}`}
                onClick={() => setIsOpen(false)}
              >
                {t('nav.howItWorks')}
              </Link>
              <Link
                href="/faq"
                className={`block px-3 py-2 text-white font-bold text-lg border-b-2 ${isActive('/faq') ? 'border-prime' : 'border-transparent'}`}
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contactus"
                className={`block px-3 py-2 text-white font-bold text-lg border-b-2 ${isActive('/contactus') ? 'border-prime' : 'border-transparent'}`}
                onClick={() => setIsOpen(false)}
              >
                {t('nav.contactUs')}
              </Link>
              <div className="px-3 pt-4 flex items-center gap-4 text-white">
                <a
                  href="https://twitter.com/"
                  className=" text-xl text-white bg-black hover:bg-[#1a4093] rounded-full p-2 border-2 border-[#000]  hover:text-[#fff]"
                >
                  <BsTwitterX />
                </a>
                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  className=" text-xl text-white bg-black hover:bg-[#1a4093] rounded-full p-2 border-2 border-[#000]  hover:text-[#fff]"
                >
                  <FaTelegram />
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;
