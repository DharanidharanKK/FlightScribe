
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plane } from "lucide-react";
import { getFlightResponse } from "@/services/flightService";
import { FlightResponse } from "@/types/flight";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const FlightChat = () => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      text: "Hello! I'm your flight assistant. Ask me about any flight (AI123, BA456, DL789, EK101) to get information.", 
      isUser: false 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: query,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuery("");
    
    try {
      const response: FlightResponse = await getFlightResponse(query);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        isUser: false
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting flight response:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I had trouble processing your request. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[400px] bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center px-4 py-2 border-b border-gray-200">
        <Plane className="h-5 w-5 text-sky-500 mr-2" />
        <h3 className="font-medium text-gray-700">Flight Assistant</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.isUser
                    ? "bg-sky-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 text-gray-800 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask about a flight..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !query.trim()}
          className="bg-sky-500 hover:bg-sky-600"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default FlightChat;
