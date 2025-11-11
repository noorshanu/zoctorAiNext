"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NavbarLight from '../components/NavbarLight';
import Footer from '../components/Footer';
import axios from 'axios';

const EmailVerify = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    if (token && email) {
      axios
        .get(`http://localhost:8000/email-verify?token=${token}&email=${email}`)
        .then((response) => {
          // Use the 'msg' field from the response
          setStatus(response.data.msg);
        })
        .catch((error) => {
          console.error('Verification error:', error);
          setStatus('Verification failed. Please try again.');
        });
    }
  }, [token, email]);

  return (
    <>
      <NavbarLight />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-[#343434] p-8 rounded-lg border border-prime shadow-xl max-w-md text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-4">{status}</h1>
          {status === 'Email verified successfully' && (
            <p className="text-gray-700 text-lg">
              Congratulations, your email <span className="font-semibold">{email}</span> has been successfully verified.
            </p>
          )}
          <div className="mt-6">
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-green-600 border border-prime text-white rounded-full shadow hover:bg-green-700 transition duration-300"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmailVerify;