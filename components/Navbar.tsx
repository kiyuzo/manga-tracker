import React from "react";


function Navbar() {
    return (
        <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-200 bg-white">
            <div className="font-bold text-2xl tracking-wide">MangaTracker</div>
            <div className="flex items-center gap-6">
                <a href="#" className="text-gray-800 font-medium hover:text-blue-600 transition-colors">My List</a>
                <span className="text-gray-500 font-normal">Username</span>
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {/* Profile picture placeholder */}
                    <svg width="24" height="24" fill="#bdbdbd" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" />
                        <ellipse cx="12" cy="17" rx="7" ry="5" />
                    </svg>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;