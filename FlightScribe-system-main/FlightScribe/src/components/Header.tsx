
import React from "react";
import { Plane } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-sky-700 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="mr-2">
            <Plane className="h-8 w-8 text-white transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FlightScribe</h1>
            <p className="text-sm text-sky-200">Real-time flight information system</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
