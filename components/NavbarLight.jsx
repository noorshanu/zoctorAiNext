"use client";
import  { useState } from "react";
import { Transition } from "@headlessui/react";
import { BsTwitterX, } from "react-icons/bs";
import {  FaTelegram } from "react-icons/fa6";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

function NavbarLight() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = ['ar', 'ur'].includes(i18n.language);

  return (
    <nav className=" bg-[#0e0e0e]  py-2  w-full z-40 absolute" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <img src="/images/logo.png" className="h-[90px]" alt=" Logo" />
          </a>
        </div>

        {/* Navigation menu */}
        <div className="hidden md:flex flex-grow justify-center">
          <a
            href="/"
            className="text-white font-bold text-lg px-3 py-2 font-archo cursor-pointer"
          >
            {t('nav.home')}
          </a>
          <Link href="/about" className="text-white font-bold text-lg px-3 py-2 cursor-pointer">
            {t('nav.aboutUs')}
          </Link>
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname !== '/') {
                window.location.href = '/#whychoose';
              } else {
                const el = document.getElementById('whychoose');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-white font-bold text-lg px-3 py-2 cursor-pointer"
          >
            {t('nav.whyChooseUs')}
          </a>
          <Link href="/faq" className="text-white font-bold text-lg px-3 py-2 cursor-pointer">
            FAQ
          </Link>
          <Link href="/contactus" className="text-white font-bold text-lg px-3 py-2 cursor-pointer">
            {t('nav.contactUs')}
          </Link>
        </div>

        {/* Wallet Connect button */}
        <div className="md:flex items-center">
          <LanguageSwitcher />
          <div className=" flex items-center gap-4 text-white  ml-5">
            <a
              href="/login" 
              className="  shadow-xl   py-2 px-4 font-archo text-center text-base rounded-3xl font-manbold font-bold   bg-[#005dff] hover:bg-[#0000] hover:border flex items-center gap-2 "
            >
              {t('nav.login')}
            </a>
          </div>
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

      {/* Mobile menu */}
      <Transition
        show={isOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        {(ref) => (
          <div
            ref={ref}
            className="md:hidden bg-black rounded-2xl border-2 border-[#000] px-2 pt-2 pb-3 space-y-1 m-4"
          >
            <a
              href="/"
              className="text-white font-bold text-lg block px-3 py-2"
            >
              {t('nav.home')}
            </a>

            <a
              href="#about"
              className="text-white font-bold text-lg block px-3 py-2"
            >
              {t('nav.aboutUs')}
            </a>
            <a
              href="#services"
              className="text-white font-bold text-lg block px-3 py-2"
            >
              {t('nav.services')}
            </a>

            <div className=" flex items-center gap-4 text-white mb-6 ml-5">
              <a
                href="https://twitter.com/Mark_8_"
                className=" text-xl text-white bg-black hover:bg-[#1a4093] rounded-full p-2 border-2 border-[#000]  hover:text-[#fff]"
              >
                <BsTwitterX />
              </a>

              <a
                href="https://t.me/Mark8_Announcements"
                target="_blank"
                rel="noreferrer"
                className=" text-xl text-white bg-black hover:bg-[#1a4093] rounded-full p-2 border-2 border-[#000]  hover:text-[#fff]"
              >
                <FaTelegram />
              </a>
            </div>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (window.location.pathname !== '/') {
                  window.location.href = '/#whychoose';
                } else {
                  const el = document.getElementById('whychoose');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-white font-bold text-lg block px-3 py-2"
            >
              {t('nav.whyChooseUs')}
            </a>
          </div>
        )}
      </Transition>
    </nav>
  );
}

export default NavbarLight;
