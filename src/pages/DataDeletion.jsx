import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaTrashAlt,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";

const DataDeletion = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-16 px-4 sm:px-6 lg:px-8"
      dir="ltr"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          <div className="bg-gradient-to-r from-[#C28B46] to-[#9E6D2E] px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <FaTrashAlt className="text-2xl" />
                User Data Deletion Instructions
              </h1>
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
              className="space-y-6"
            >
              <div className="flex items-start gap-4 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex-shrink-0">
                  <FaEnvelope className="text-2xl text-amber-600 dark:text-amber-400" />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-800 dark:text-gray-200 text-lg">
                    If you wish to delete your data associated with our
                    application, please send an email to:
                  </p>
                  <a
                    href="mailto:triples.software.1@gmail.com"
                    className="inline-block text-[#C28B46] hover:text-[#9E6D2E] font-bold text-xl transition-colors bg-amber-50 dark:bg-amber-900/20 px-6 py-3 rounded-lg"
                  >
                    triples.software.1@gmail.com
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#C28B46] rounded-full"></span>
                  Email Instructions
                </h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#C28B46]">Subject:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                      Data Deletion Request
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="font-bold text-[#C28B46]">Message:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Please include your registered email address in the
                      message.
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-2xl text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      Processing Time
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      We will process your request within{" "}
                      <span className="font-bold text-[#C28B46]">48 hours</span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataDeletion;
