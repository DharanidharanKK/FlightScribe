
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageSquare } from "lucide-react";
import FlightSearch from "./FlightSearch";
import FlightChat from "./FlightChat";

const FlightTabs = () => {
  return (
    <Tabs defaultValue="search" className="w-full max-w-3xl mx-auto">
      <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-8">
        <TabsTrigger value="search" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Flight Search
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat Assistant
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="search" className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Search for a Flight</h2>
          <p className="text-gray-600 mt-2">
            Enter a flight number to get real-time information
          </p>
        </div>
        <FlightSearch />
      </TabsContent>
      
      <TabsContent value="chat" className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Flight Assistant</h2>
          <p className="text-gray-600 mt-2">
            Ask questions about your flight in natural language
          </p>
        </div>
        <FlightChat />
      </TabsContent>
    </Tabs>
  );
};

export default FlightTabs;
