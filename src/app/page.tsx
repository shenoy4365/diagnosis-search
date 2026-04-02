"use client";

import * as React from "react";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { ResponseCard } from "@/components/ResponseCard";
import { Button } from "@/components/ui/button";
import type { SourceCardProps } from "@/components/SourceCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCardProps[];
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual API calls later)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about "${query}". This is a demo response showing how the interface will work. In the next phases, this will be replaced with real AI-powered responses from Cerebras and Groq APIs, along with web scraping for accurate medical information.`,
        sources: [
          {
            title: "Mayo Clinic - Comprehensive Health Information",
            url: "https://www.mayoclinic.org",
            snippet:
              "Trusted medical information and expert health advice from Mayo Clinic.",
            domain: "mayoclinic.org",
            credibilityScore: 95,
          },
          {
            title: "PubMed Central - Medical Research Database",
            url: "https://www.ncbi.nlm.nih.gov/pmc/",
            snippet:
              "Free archive of biomedical and life sciences journal literature.",
            domain: "ncbi.nlm.nih.gov",
            credibilityScore: 98,
          },
          {
            title: "CDC - Centers for Disease Control",
            url: "https://www.cdc.gov",
            snippet:
              "Official health information and guidelines from the CDC.",
            domain: "cdc.gov",
            credibilityScore: 97,
          },
        ],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const exampleQueries = [
    "What are the symptoms of type 2 diabetes?",
    "How does mRNA vaccine technology work?",
    "Latest treatments for migraine headaches",
    "Explain the difference between type 1 and type 2 diabetes",
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-12 animate-fade-in">
                  <div className="mb-6 flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-2xl">A</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Good afternoon, John
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl">
                    I&apos;m Diagnosis, your AI health assistant powered by the latest
                    medical research. I&apos;m here to chat about your health
                    concerns and guide you through treatment advice.
                  </p>
                </div>

                {/* Example Queries */}
                <div className="w-full max-w-2xl mt-8 space-y-3 animate-slide-up">
                  <p className="text-sm text-muted-foreground text-center">
                    Try asking:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exampleQueries.map((query, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-auto py-4 px-5 text-left justify-start hover:border-primary transition-all"
                        onClick={() => handleSearch(query)}
                      >
                        <span className="text-sm">{query}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl max-w-[80%] shadow-sm">
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <ResponseCard
                        content={message.content}
                        sources={message.sources}
                      />
                    )}
                  </div>
                ))}

                {isLoading && (
                  <ResponseCard
                    content="Analyzing medical research and synthesizing response..."
                    isStreaming={true}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Fixed at bottom */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <p className="text-xs text-muted-foreground text-center mt-3">
              This tool provides information for educational purposes only.
              Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
