
import { FlightInfo, FlightResponse, AeroDataApiResponse } from "@/types/flight";

// AeroDataBox API configuration
const AERODATA_API_KEY = "a6ddd1d464msh5d21ae2797ddfe6p1c1fcbjsna4e9a64b2b07";
const AERODATA_HOST = "aerodatabox.p.rapidapi.com";

// Mock flight database as fallback
const FLIGHT_DATABASE: Record<string, FlightInfo> = {
  "AI123": {
    "flight_number": "AI123",
    "departure_time": "08:00 AM",
    "destination": "Delhi",
    "status": "Delayed"
  },
  "BA456": {
    "flight_number": "BA456",
    "departure_time": "10:15 AM",
    "destination": "London",
    "status": "On Time"
  },
  "DL789": {
    "flight_number": "DL789",
    "departure_time": "02:30 PM",
    "destination": "New York",
    "status": "Boarding"
  },
  "EK101": {
    "flight_number": "EK101",
    "departure_time": "11:45 PM",
    "destination": "Dubai",
    "status": "Scheduled"
  },
  "EI525": {
    "flight_number": "EI525",
    "departure_time": "10:30 AM",
    "destination": "Dublin",
    "status": "On Time"
  },
  "UAE42X": {
    "flight_number": "UAE42X",
    "departure_time": "12:46 PM",
    "departure_airport": "Dubai International",
    "destination": "Dubai",
    "status": "Departed"
  },
  "DL47": {
    "flight_number": "DL47",
    "departure_time": "10:05 AM",
    "departure_airport": "London Heathrow",
    "destination": "New York John F Kennedy",
    "status": "Departed",
    "aircraft": "Boeing 777-200"
  }
};

// Delay function to simulate API call when needed
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getFlightInfo = async (flightNumber: string): Promise<FlightInfo | null> => {
  console.log(`Searching for flight: ${flightNumber}`);
  
  try {
    // Normalize flight number (remove spaces and convert to uppercase)
    const normalizedFlightNumber = flightNumber.replace(/\s+/g, '').toUpperCase();
    
    // Make request to AeroDataBox API
    const response = await fetch(`https://aerodatabox.p.rapidapi.com/flights/number/${normalizedFlightNumber}?withAircraftImage=false&withLocation=false`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': AERODATA_API_KEY,
        'x-rapidapi-host': AERODATA_HOST
      }
    });
    
    if (response.ok) {
      const data = await response.json() as AeroDataApiResponse[];
      
      if (Array.isArray(data) && data.length > 0) {
        const flightData = data[0];
        
        // Extract the relevant flight information
        // Handle complex time objects by extracting the local string value
        const departureTime = flightData.departure?.scheduledTime?.local || 
                              (typeof flightData.departure?.scheduledTime === 'string' ? 
                               flightData.departure?.scheduledTime : "Unknown");
                               
        // Format the time string to remove timezone information if present
        const formattedDepartureTime = typeof departureTime === 'string' ? 
                                     departureTime.replace(/(\d{4}-\d{2}-\d{2}\s)(\d{2}:\d{2}).*/, '$1$2') : 
                                     "Unknown";
        
        const formattedData: FlightInfo = {
          flight_number: normalizedFlightNumber,
          departure_time: formattedDepartureTime,
          departure_airport: flightData.departure?.airport?.name || undefined,
          destination: flightData.arrival?.airport?.name || "Unknown",
          status: flightData.status || "Unknown",
          aircraft: flightData.aircraft?.model
        };
        
        return formattedData;
      }
    }
    
    // If API call fails or returns no data, fall back to mock database
    console.log("API call failed or no data returned, falling back to mock database");
    return FLIGHT_DATABASE[normalizedFlightNumber] || null;
    
  } catch (error) {
    console.error("Error fetching flight data:", error);
    // Fall back to mock database if an exception occurs
    return FLIGHT_DATABASE[flightNumber] || null;
  }
};

export const getFlightResponse = async (query: string): Promise<FlightResponse> => {
  console.log(`Processing query: ${query}`);
  
  // Extract flight number using regex (simulating the LLM extraction)
  const flightNumberMatch = query.match(/[A-Z]{2}\d{1,4}|[A-Z]{3}\d{1,3}[A-Z]/i);
  const flightNumber = flightNumberMatch ? flightNumberMatch[0].toUpperCase() : null;
  
  if (!flightNumber) {
    return { answer: "Sorry, I couldn't identify a flight number in your query." };
  }
  
  const flightInfo = await getFlightInfo(flightNumber);
  
  if (!flightInfo) {
    return { answer: `Flight ${flightNumber} not found in database.` };
  }
  
  // Format a comprehensive response with all available flight details
  let responseText = `Flight ${flightInfo.flight_number} `;
  
  if (flightInfo.departure_airport) {
    responseText += `departs from ${flightInfo.departure_airport} `;
  }
  
  responseText += `at ${flightInfo.departure_time} to ${flightInfo.destination}. `;
  responseText += `Current status: ${flightInfo.status}.`;
  
  if (flightInfo.aircraft) {
    responseText += ` Aircraft: ${flightInfo.aircraft}.`;
  }
  
  return { answer: responseText };
};
