
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plane } from "lucide-react";
import { getFlightInfo } from "@/services/flightService";
import { FlightInfo } from "@/types/flight";
import { useToast } from "@/components/ui/use-toast";

const FlightSearch = () => {
  const [flightNumber, setFlightNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flightData, setFlightData] = useState<FlightInfo | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flightNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a flight number",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getFlightInfo(flightNumber);
      setFlightData(data);
      
      if (!data) {
        toast({
          title: "Flight not found",
          description: `No information available for flight ${flightNumber}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Flight found",
          description: `Found information for ${data.flight_number}`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching flight data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch flight information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter flight number (e.g. AI123, DL47, UAE42X)"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            className="pl-10 border-sky-200 focus:border-sky-400"
          />
          <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-sky-600 hover:bg-sky-700"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </span>
          )}
        </Button>
      </form>
      
      {flightData && (
        <div className="mt-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Flight Information</h3>
          <div className="bg-white rounded-lg shadow-md p-4 border border-sky-100">
            <div className="flex justify-between items-center mb-4">
              <div className="text-2xl font-bold text-sky-800">{flightData.flight_number}</div>
              <StatusBadge status={flightData.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              {flightData.departure_airport && (
                <InfoItem label="Departure Airport" value={flightData.departure_airport} />
              )}
              <InfoItem label="Destination" value={flightData.destination} />
              <InfoItem label="Departure Time" value={flightData.departure_time} />
              {flightData.aircraft && (
                <InfoItem label="Aircraft" value={flightData.aircraft} />
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-3 text-center">
              {flightData.departure_airport ? 'Live data from AeroDataBox API' : 'Data from fallback database'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-200";
  
  switch (status) {
    case "On Time":
      bgColor = "bg-flight-on-time";
      break;
    case "Delayed":
      bgColor = "bg-flight-delayed";
      break;
    case "Boarding":
      bgColor = "bg-flight-boarding";
      break;
    case "Scheduled":
      bgColor = "bg-flight-scheduled";
      break;
    case "Departed":
      bgColor = "bg-green-600";
      break;
  }
  
  return (
    <span className={`${bgColor} text-white text-sm py-1 px-3 rounded-full font-medium`}>
      {status}
    </span>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export default FlightSearch;
