import React from "react";

function Footer() {
	const year = new Date().getFullYear();
	return (
		<footer className="w-full py-4 border-t border-gray-200 bg-white text-center text-gray-500 text-sm mt-8">
			&copy; {year} Mas Godas
		</footer>
	);
}

export default Footer;
