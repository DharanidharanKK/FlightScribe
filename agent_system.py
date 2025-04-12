import os
import json
import re
import http.client
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import groq

# Load environment variables
load_dotenv("api_keys.env")

# Get API keys from environment
groq_api_key = os.getenv("GROQ_API_KEY")
aerodata_api_key = os.getenv("AERODATA_API_KEY", "a6ddd1d464msh5d21ae2797ddfe6p1c1fcbjsna4e9a64b2b07")
aerodata_host = os.getenv("AERODATA_HOST", "aerodatabox.p.rapidapi.com")

if not groq_api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")

# Initialize Groq client
client = groq.Client(api_key=groq_api_key)

# Mock flight database as fallback
FLIGHT_DATABASE = {
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
        "destination": "Dubai",
        "status": "Departed"
    },
    "DL47": {
        "flight_number": "DL47",
        "departure_time": "10:05 AM",
        "destination": "New York John F Kennedy",
        "status": "Departed"
    }
}

def get_flight_info(flight_number: str) -> Dict[str, Any]:
    """
    Retrieves flight information from AeroDataBox API.
    
    Args:
        flight_number: The flight identifier
        
    Returns:
        Dictionary with flight details or empty dict if not found
    """
    try:
        # Establish connection to the API
        conn = http.client.HTTPSConnection(aerodata_host)
        
        # Set up headers
        headers = {
            'x-rapidapi-key': aerodata_api_key,
            'x-rapidapi-host': aerodata_host
        }
        
        # Make the request
        conn.request("GET", f"/flights/number/{flight_number}?withAircraftImage=false&withLocation=false", headers=headers)
        
        # Get the response
        res = conn.getresponse()
        data = res.read()
        
        # Parse the JSON response
        if res.status == 200:
            flight_data = json.loads(data.decode("utf-8"))
            
            # Parse the AeroDataBox API response format
            # This will need to be adjusted based on the actual response structure
            if isinstance(flight_data, list) and flight_data:
                flight = flight_data[0]  # Take the first flight if multiple are returned
                
                # Extract relevant flight information
                departure = flight.get("departure", {})
                arrival = flight.get("arrival", {})
                
                formatted_data = {
                    "flight_number": flight_number,
                    "departure_time": departure.get("scheduledTime", "Unknown"),
                    "departure_airport": departure.get("airport", {}).get("name", "Unknown"),
                    "destination": arrival.get("airport", {}).get("name", "Unknown"),
                    "status": flight.get("status", "Unknown"),
                    "aircraft": flight.get("aircraft", {}).get("model", "Unknown")
                }
            else:
                formatted_data = {
                    "flight_number": flight_number,
                    "error": "No flight data available"
                }
            
            return formatted_data
        else:
            print(f"Error fetching flight data: Status code {res.status}")
            # Fall back to mock database if API request fails
            return FLIGHT_DATABASE.get(flight_number, {})
            
    except Exception as e:
        print(f"Exception occurred while fetching flight data: {e}")
        # Fall back to mock database if an exception occurs
        return FLIGHT_DATABASE.get(flight_number, {})

def info_agent_request(flight_number: str) -> str:
    """
    Info Agent that returns flight data in JSON format.
    
    Args:
        flight_number: The flight identifier
        
    Returns:
        JSON string with flight information
    """
    flight_data = get_flight_info(flight_number)
    return json.dumps(flight_data)

def extract_flight_number(query: str) -> Optional[str]:
    """
    Extract flight number from user query using LLM.
    
    Args:
        query: User's flight query
        
    Returns:
        Extracted flight number or None if not found
    """
    system_prompt = """
    You are a flight information extraction assistant. Your only task is to extract the 
    flight number from the user query. Return ONLY the flight number without any additional text.
    If no flight number is found, return "NONE".
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",  # Using Groq's LLaMa 3 model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract the flight number from: '{query}'"}
            ],
            temperature=0.0,
            max_tokens=10
        )
        
        extracted_number = response.choices[0].message.content.strip()
        
        # Return None if no flight number found
        if extracted_number == "NONE":
            return None
            
        return extracted_number
    except Exception as e:
        print(f"Error extracting flight number: {e}")
        
        # Fallback to regex extraction if API fails
        pattern = r'[A-Z]{2}\d{3}|Flight\s+([A-Z]{2}\d{3})'
        matches = re.findall(pattern, query, re.IGNORECASE)
        
        if matches:
            # If matches is a list of tuples, extract from first group
            if isinstance(matches[0], tuple) and matches[0]:
                return matches[0][0]
            return matches[0]
        
        return None

def qa_agent_respond(user_query: str) -> str:
    """
    QA Agent that processes user queries, calls Info Agent, and returns structured responses.
    
    Args:
        user_query: User's flight query
        
    Returns:
        JSON formatted answer to the user query
    """
    # Extract flight number from query
    flight_number = extract_flight_number(user_query)
    
    if not flight_number:
        return json.dumps({"answer": "Sorry, I couldn't identify a flight number in your query."})
    
    # Get flight information via Info Agent
    flight_info_json = info_agent_request(flight_number)
    flight_info = json.loads(flight_info_json)
    
    if not flight_info or flight_info.get("error"):
        return json.dumps({"answer": f"Flight {flight_number} not found in database."})
    
    # Generate a user-friendly response using LLM
    system_prompt = """
    You are a helpful flight information assistant. Format the response based on the flight data.
    Return ONLY the final answer text without any additional formatting or explanation.
    Make the response concise but informative, including all relevant flight details.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Create a response for this flight data: {flight_info_json}"}
            ],
            temperature=0.2,
            max_tokens=100
        )
        
        answer_text = response.choices[0].message.content.strip()
        
        # Fallback answer if LLM fails to give proper response
        if not answer_text or len(answer_text) < 10:
            answer_text = generate_fallback_response(flight_info)
            
        return json.dumps({"answer": answer_text})
    except Exception as e:
        print(f"Error generating response: {e}")
        
        # Fallback without LLM
        answer_text = generate_fallback_response(flight_info)
        return json.dumps({"answer": answer_text})

def generate_fallback_response(flight_info: Dict[str, Any]) -> str:
    """
    Generate a fallback response when LLM generation fails.
    
    Args:
        flight_info: Dictionary containing flight information
        
    Returns:
        Formatted response string
    """
    # Add departure airport if available
    departure_text = ""
    if flight_info.get("departure_airport"):
        departure_text = f" from {flight_info['departure_airport']}"
    
    # Format basic flight information
    return f"Flight {flight_info['flight_number']} departs at {flight_info['departure_time']}{departure_text} to {flight_info['destination']}. Current status: {flight_info['status']}."

def main():
    # Example usage
    flight_number = "DL47"  # Delta Airlines flight
    print(f"\nFetching information for flight {flight_number}...")
    flight_info = get_flight_info(flight_number)
    
    if flight_info:
        print("\nFlight Information:")
        print(f"Flight Number: {flight_info['flight_number']}")
        print(f"Departure Time: {flight_info['departure_time']}")
        print(f"Destination: {flight_info['destination']}")
        print(f"Status: {flight_info['status']}")
    else:
        print(f"No information found for flight {flight_number}")

if __name__ == "__main__":
    main()