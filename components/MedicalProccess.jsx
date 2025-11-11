/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { FaBrain, FaHospital, FaGlobe, FaUserPlus } from "react-icons/fa";

const steps = [
  {
    title: "Sign Up & Set Your Preferences",
    description:
      "Create an account and set your medical preferences, language, and communication mode.",
    icon: <FaUserPlus className="text-4xl text-blue-500" />,
  },
  {
    title: "AI-Powered Consultation",
    description:
      "Use our intelligent chatbot to describe your symptoms or upload your medical reports for AI-powered analysis.",
    icon: <FaBrain className="text-4xl text-pink-500" />,
  },
  {
    title: "Smart Treatment Recommendation",
    description:
      "Get personalized Hospital or Doctor recommendations and appointments in seconds.",
    icon: <FaHospital className="text-4xl text-green-500" />,
  },
  {
    title: "Global Medical Access",
    description:
      "Connect with top international hospitals and specialists. Support for medical tourism, second opinions, and cross-border healthcare solutions.",
    icon: <FaGlobe className="text-4xl text-yellow-500" />,
  },
];

const Card = ({ children }) => (
  <div className=" shadow-lg rounded-2xl p-6 flex items-center space-x-4 transform hover:scale-105 transition duration-300">
    {children}
  </div>
);

const CardContent = ({ children }) => <div className="mt-2">{children}</div>;

export default function MedicalProcess() {
  return (
    <div className="min-h-screen flex flex-col items-center pb-12 pt-[10%] px-6">
      <h1 className="text-4xl font-bold text-white mb-10">How It Works</h1>
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl nft border p-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.3 }}
          >
            <Card>
              <div className="p-4 bg-white rounded-full">{step.icon}</div>
              <CardContent>
                <h2 className="text-xl font-semibold text-white">Step {index + 1} : {step.title}</h2>
                <p className="text-white mt-2">{step.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
