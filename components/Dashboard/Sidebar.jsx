import { useState, useEffect } from 'react';
import { FaHome, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { IoAnalyticsOutline } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from localStorage when component mounts
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1a1a] text-white shadow-lg hover:bg-[#2a2a2a] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#0e0e0e] text-white w-64 shadow-xl z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-[#565656] pb-4 p-4">
          <img src="/images/logo.png" alt="Logo" className="h-[100px] mx-auto" />
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-[#1a1a1a] text-white shadow-md' 
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'}`
            }
          >
            <FaHome className="text-xl" /> 
            <span className="font-medium">Dashboard</span>
          </NavLink>

          {userId && (
            <NavLink
              to={`/profile/${userId}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[#1a1a1a] text-white shadow-md' 
                  : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'}`
              }
            >
              <FaUser className="text-xl" />
              <span className="font-medium">Profile</span>
            </NavLink>
          )}

          <NavLink
            to={`/your-report/${userId}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-[#1a1a1a] text-white shadow-md' 
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'}`
            }
          >
            <FiFileText className="text-xl" />
            <span className="font-medium">Your reports</span>
          </NavLink>

          <NavLink
            to={`/reports/${userId}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
              ${isActive 
                ? 'bg-[#1a1a1a] text-white shadow-md' 
                : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'}`
            }
          >
            <IoAnalyticsOutline className="text-xl" />
            <span className="font-medium">Get analysis</span>
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;