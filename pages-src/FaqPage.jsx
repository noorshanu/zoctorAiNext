"use client";

import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FaqSection from "../sections/FaqSection";

function FaqPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="css-1vx3a4p"></div>
      <Navbar />

      {/* Hero Section */}
      <motion.section 
        className=" py-4  md:py-4 mt-[96px]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            variants={itemVariants}
          >
            <h1 className="text-4xl txt-grad  md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              variants={itemVariants}
            >
              Get answers to your questions about ZoctorAI&apos;s medical report analysis, 
              health insights, and international healthcare solutions.
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto mt-12"
            variants={containerVariants}
          >
            {[
              {
                title: "Medical Reports",
                description: "Learn about our AI-powered medical report analysis",
                icon: "📋"
              },
              {
                title: "Health Insights",
                description: "Discover personalized health recommendations",
                icon: "🔍"
              },
              {
                title: "Healthcare Solutions",
                description: "Explore international treatment options",
                icon: "🏥"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className=" rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                variants={itemVariants}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Search Section */}
      {/* <motion.section 
        className="py-12 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-prime transition-colors duration-200"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-prime text-white rounded-full hover:bg-blue-600 transition-colors duration-200">
              Search
            </button>
          </div>
        </div>
      </motion.section> */}

      {/* FAQ Categories */}
      {/* <motion.section 
        className="py-8 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {['All', 'Getting Started', 'Medical Reports', 'Health Insights', 'Treatment Options'].map((category) => (
              <button
                key={category}
                className="px-6 py-2 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:border-prime hover:text-prime transition-colors duration-200"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </motion.section> */}

      {/* FAQ Section Component */}
      <FaqSection />

      {/* Contact Section */}
      <motion.section 
        className="py-16 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-lg text-white mb-8">
            We&apos;re here to help. Contact our support team for assistance.
          </p>
          <a href="/contactus" className="px-8 py-3 bg-prime text-white rounded-full hover:bg-blue-600 transition-colors duration-200">
            Contact Support
          </a>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}

export default FaqPage;