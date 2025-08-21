import React from "react";

function SearchBar() {
    return (
        <div className="flex items-center w-full max-w-md bg-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
                placeholder="Search manga..."
                disabled
            />
        </div>
    );
}

export default SearchBar;