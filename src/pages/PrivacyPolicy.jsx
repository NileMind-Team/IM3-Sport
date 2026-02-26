import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8"
      dir="ltr"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-gradient-to-r from-[#C28B46] to-[#A67435] px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <Link
                to="/"
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
              >
                <FaArrowRight className="text-sm" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="prose prose-lg dark:prose-invert max-w-none"
            >
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-r-4 border-[#C28B46]">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                  We collect user name and email address through Facebook Login
                  for authentication purposes only.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-r-4 border-[#C28B46]">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                  The collected data is used solely to create and manage user
                  accounts within our application.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-r-4 border-[#C28B46]">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                  We do not sell, share, or distribute user data to third
                  parties.
                </p>
              </div>

              <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C28B46] rounded-full"></span>
                  Contact Information
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  If you have any questions regarding this Privacy Policy, you
                  may contact us at:
                </p>
                <a
                  href="mailto:triples.software.1@gmail.com"
                  className="inline-block mt-3 text-[#C28B46] hover:text-[#8B5E2E] font-medium text-lg transition-colors"
                >
                  triples.software.1@gmail.com
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
