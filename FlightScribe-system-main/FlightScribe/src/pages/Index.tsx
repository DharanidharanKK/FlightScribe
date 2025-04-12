
import React from "react";
import Header from "@/components/Header";
import FlightTabs from "@/components/FlightTabs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow py-10 px-4">
        <div className="container mx-auto">
          <FlightTabs />
          
          <div className="mt-16 bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Available Test Flights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { number: "AI123", destination: "Delhi", status: "Delayed" },
                { number: "BA456", destination: "London", status: "On Time" },
                { number: "DL789", destination: "New York", status: "Boarding" },
                { number: "EK101", destination: "Dubai", status: "Scheduled" },
                { number: "DL47", destination: "New York JFK", status: "Departed" },
                { number: "UAE42X", destination: "Dubai", status: "Departed" },
                { number: "EI525", destination: "Dublin", status: "On Time" }
              ].map((flight) => (
                <div 
                  key={flight.number} 
                  className="p-4 border border-gray-200 rounded-md hover:bg-sky-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-sky-700">{flight.number}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      flight.status === 'On Time' ? 'bg-flight-on-time text-white' :
                      flight.status === 'Delayed' ? 'bg-flight-delayed text-white' :
                      flight.status === 'Boarding' ? 'bg-flight-boarding text-white' :
                      flight.status === 'Departed' ? 'bg-green-600 text-white' :
                      'bg-flight-scheduled text-white'
                    }`}>
                      {flight.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Destination: {flight.destination}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
