/* eslint-disable react/prop-types */
import React, { Suspense } from 'react';
import Loader from '../../components/Loader';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Navbar */}
        <Navbar />
        {/* Content */}
        <Suspense fallback={<Loader />}>
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Suspense>
      </div>
    </div>
  );
};

export default Layout;
