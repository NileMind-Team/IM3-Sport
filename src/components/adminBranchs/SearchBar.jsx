import React from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative group">
        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#C28B46] text-sm transition-all duration-300 group-focus-within:scale-110" />{" "}
        {/* Updated: Icon color */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl sm:rounded-2xl pr-10 pl-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#C28B46] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg hover:border-gray-400 dark:hover:border-gray-500" // Updated: Focus ring color
          placeholder={placeholder}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-[#C28B46] transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded p-1 hover:border-[#C28B46]" // Updated: Hover text color and hover border color
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
