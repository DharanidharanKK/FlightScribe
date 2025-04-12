
import React from "react";

const Footer = () => {
  return (
    <footer className="py-6 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FlightScribe System. All rights reserved.
          </p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="text-sm text-sky-600 hover:text-sky-800">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-sky-600 hover:text-sky-800">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-sky-600 hover:text-sky-800">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
