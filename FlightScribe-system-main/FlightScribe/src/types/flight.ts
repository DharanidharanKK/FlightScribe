
export interface FlightInfo {
  flight_number: string;
  departure_time: string;
  departure_airport?: string;
  destination: string;
  status: 'On Time' | 'Delayed' | 'Boarding' | 'Scheduled' | 'Departed' | string;
  aircraft?: string;
}

export interface FlightResponse {
  answer: string;
}

export interface AeroDataApiResponse {
  departure?: {
    airport?: {
      name?: string;
    };
    scheduledTime?: {
      utc?: string;
      local?: string;
    } | string;
  };
  arrival?: {
    airport?: {
      name?: string;
    };
  };
  status?: string;
  aircraft?: {
    model?: string;
  };
}
