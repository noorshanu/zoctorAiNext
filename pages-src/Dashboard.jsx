import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiAward, FiClock, FiShield, FiTrendingUp, FiUsers } from 'react-icons/fi';
import Layout from '../components/Dashboard/Layout';

function Dashboard() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from localStorage when component mounts
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  return (
    <Layout>
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-[#000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Welcome to Zoctor Ai Report Analysis
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Get instant insights from your medical reports using advanced AI analysis
            </p>
            <Link
              to={userId ? `/reports/${userId}` : '/login'}
              className="inline-flex text-[#fff] items-center px-6 py-3 border border-transparent text-base font-medium bg-prime rounded-md text-indigo-700 bg-white hover:bg-blue-50 transition-colors duration-300"
            >
              <FiFileText className="w-5 h-5 mr-2" />
              Get Your Report Analysis Today
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-[#000]">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose Our Analysis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiClock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Instant Analysis
            </h3>
            <p className="text-gray-600">
              Get detailed insights from your medical reports within seconds using our advanced AI technology.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FiAward className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Expert Precision
            </h3>
            <p className="text-gray-600">
              Our AI is trained on millions of medical reports to provide accurate and reliable analysis.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FiShield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your medical data is encrypted and protected with the highest security standards.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <FiTrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trend Analysis
            </h3>
            <p className="text-gray-600">
              Track your health metrics over time with comprehensive trend analysis and insights.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <FiUsers className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Sharing
            </h3>
            <p className="text-gray-600">
              Securely share your analysis with healthcare providers or family members.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-prime  ">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <FiFileText className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Summary
            </h3>
            <p className="text-gray-600">
              Get clear, actionable summaries of your medical reports in plain language.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            to={userId ? `/reports/${userId}` : '/login'}
            className="inline-flex text-[#fff] bg-prime items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
          >
            Start Your Analysis
            <FiFileText className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;