"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "1. What is ZoctorAI?",
      answer: "ZoctorAI is an AI-powered health assistant that provides personalized health insights, predictive health analytics, and connects users to world-class international medical treatment options. Our platform leverages advanced AI algorithms to analyze medical reports and recommend the best healthcare solutions."
    },
    {
      question: "2. How does ZoctorAI work?",
      answer: `ZoctorAI works in three simple steps:\n\n1. Upload Medical Records: Users upload their latest health reports for AI-based analysis.\n2. Receive AI-Generated Health Summary: The AI processes the data and generates a free health summary.\n3. Get Personalized Recommendations: Users can upgrade to a detailed Premium Health Report or explore international treatment options.`
    },
    {
       question: "3. Who can use ZoctorAI?",
      answer: `ZoctorAI is designed for individuals looking for personalized health insights, early risk detection, and access to advanced healthcare abroad. It is beneficial for:\n\n• Patients seeking detailed health analysis.\n• Individuals considering medical tourism.\n• Users looking for affordable international healthcare options.`
    },
    {
      question: "4. Why do I need to upload my medical records?",
      answer: "Uploading your latest medical reports enables ZoctorAI to generate accurate and personalized health insights. Without these, our AI can only provide general health recommendations."
    },
    {
      question: "5. What types of medical records can I upload?",
      answer: "ZoctorAI supports the following file formats: PDF, JPEG, PNG, DICOM. Accepted medical documents include blood tests, MRI, CT scans, X-rays, and pathology reports."
    },
    {
      question: "6. Is my data secure?",
      answer: "Yes! ZoctorAI uses advanced encryption protocols to ensure complete data security and compliance with privacy laws (GDPR, HIPAA). Your data is not shared with third parties without your consent."
    },
    {
      question: "7. How long does it take to receive my AI-generated health summary?",
      answer: "The free AI-generated health summary is typically available within minutes after uploading your medical records."
    },
    {
      question: "8. What if I don’t have my medical reports?",
      answer: "If you don’t have medical records, ZoctorAI can provide general health insights, but we highly recommend uploading your reports for accurate and personalized analysis."
    },
    {
      question: "9. What is the Premium Health Report?",
      answer: "The Premium Health Report is a detailed, AI-generated report that includes: Comprehensive Health Analysis, Risk Assessments & Predictive Trends, Personalized Nutrition & Lifestyle Adjustments, Early Detection of Potential Health Issues, Ongoing Monitoring Recommendations."
    },
    {
      question: "10. How much does the services cost?",
      answer: "The services pricing are as  follows:\nHealth Reveal : $9.99\nVitality Track: $34.99\nPrecision + 360: $99 \nMedical Tourism: $50"
    },
    {
      question: "11. How do I purchase the Premium Report?",
      answer: "You can purchase the report directly through the ZoctorAI platform using credit/debit cards, PayPal, or other secure payment options."
    },
    {
      question: "12. Can I upgrade to the Premium Report after receiving my free summary?",
      answer: "Yes! You can upgrade anytime to get detailed insights and proactive health recommendations."
    },
    {
      question: "13. Can I get a refund if I am not satisfied with the Premium Report?",
      answer: "No, the Premium Report is non-refundable since it is generated based on personalized medical data. However, if you experience any technical issues, our support team will assist you."
    },
    {
      question: "14. How does ZoctorAI help with medical tourism?",
      answer: "ZoctorAI connects users with top international hospitals and specialists, helping them access cost-effective treatments, shorter waiting times, and advanced medical technology."
    },
    {
      question: "15. What countries does ZoctorAI offer treatment in?",
      answer: "ZoctorAI has partnerships with renowned hospitals in: India, UAE, Turkey, Thailand, Germany, Singapore, and South Korea."
    },
    {
      question: "16. How do I book a consultation with an international specialist?",
      answer: "You can book a virtual consultation with a specialist by paying a fully refundable token deposit to secure your slot."
    },
    {
      question: "17. How much does an international consultation cost?",
      answer: "Consultation fees vary based on the specialist and hospital. The initial deposit is fully adjustable against the total treatment cost."
    },
    {
      question: "18. Can ZoctorAI assist with travel arrangements?",
      answer: "Yes! ZoctorAI provides full travel support, including visa processing assistance, hospital & hotel bookings, airport pickups & local transportation."
    },
    {
      question: "19. Will I have support while receiving treatment abroad?",
      answer: "Absolutely! ZoctorAI ensures you receive on-ground support, language translation assistance, and a dedicated care coordinator throughout your treatment."
    },
    {
      question: "20. What payment methods are accepted on ZoctorAI?",
      answer: "We accept:\n• Credit/Debit Cards (Visa, MasterCard, AMEX)\n• PayPal\n• Bank Transfers"
    },
    {
      question: "21. Is my payment information secure?",
      answer: "Yes! ZoctorAI follows PCI DSS-compliant security standards to keep your payment details safe."
    },
    {
      question: "22. What if I need to cancel my medical consultation or treatment?",
      answer: "Consultations: Refundable if canceled 48 hours before the appointment.\nTreatment Bookings: Refund policies depend on the hospital and service provider."
    },
    {
      question: "23. Can I reschedule my medical consultation?",
      answer: "Yes, consultations can be rescheduled at no extra charge if done at least 24 hours in advance."
    },
    {
      question: "24. How do I contact ZoctorAI support?",
      answer: "You can reach us via:\n• Live Chat on ZoctorAI.com\n• Email: support@zoctorai.com\n• WhatsApp & Telegram Support"
    },
    {
      question: "25. What if I have an issue with my report or consultation?",
      answer: "Our 24/7 customer support will assist you with any queries regarding reports, consultations, or treatment bookings."
    },
    {
      question: "26. Is ZoctorAI available in multiple languages?",
      answer: "Yes! ZoctorAI supports: English, Arabic, French, Hindi, Spanish, and more."
    },
    {
      question: "27. How do I provide feedback on ZoctorAI’s services?",
      answer: "We welcome your feedback! You can submit your reviews through our customer portal or email us at feedback@zoctorai.com."
    },
    {
      question: "28. Will ZoctorAI offer AI-powered virtual doctors in the future?",
      answer: "Yes! We are actively developing AI-driven virtual doctor consultations to provide even more accessible healthcare services."
    },
    {
      question: "29. Can I track my health over time with ZoctorAI?",
      answer: "Yes! Our future updates will introduce ongoing health monitoring and personalized AI-driven health alerts."
    },
    {
      question: "30. How do I stay updated on new ZoctorAI features?",
      answer: "Follow us on social media or subscribe to our newsletter for the latest updates!"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-4 ">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h2 className="text-3xl md:text-4xl txt-grad font-sfpro font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about ZoctorAI
          </p>
        </motion.div> */}

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-[#1a1a1a] transition-colors duration-200"
              >
                <span className="text-left font-medium text-white hover:text-black ">
                  {faq.question}
                </span>
                <span className="ml-4 flex-shrink-0">
                  {activeIndex === index ? (
                    <FiMinus className="h-5 w-5 text-prime" />
                  ) : (
                    <FiPlus className="h-5 w-5 text-gray-400" />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={contentVariants}
                  >
                    <div className="px-6 py-4 bg-[#1a1a1a]">
                      <p className="text-white whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FaqSection;