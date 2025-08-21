import React from "react";

function MyList() {
    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                </svg>
                <span className="text-center">Your manga list is empty.<br />Add some manga to get started!</span>
            </div>
        </div>
    );
}

export default MyList;