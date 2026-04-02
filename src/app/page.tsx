"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { ResponseCard } from "@/components/ResponseCard";
import { Button } from "@/components/ui/button";
import type { SourceCardProps } from "@/components/SourceCard";
import { HamburgerMenuIcon, GearIcon, ExitIcon } from "@radix-ui/react-icons";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
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
      <Sidebar
        onNewChat={handleNewChat}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Hamburger and Actions */}
        <div className="border-b border-border/40 bg-background px-4 py-3 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8"
            >
              <motion.div
                animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <HamburgerMenuIcon className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="h-8 gap-2 px-3"
                onClick={() => console.log("Settings clicked")}
              >
                <GearIcon className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                className="h-8 gap-2 px-3"
                onClick={() => console.log("Logout clicked")}
              >
                <ExitIcon className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="text-center mb-16 max-w-3xl"
                >
                  <h1 className="text-3xl md:text-4xl font-medium mb-3 text-foreground">
                    Good afternoon, John
                  </h1>
                  <p className="text-muted-foreground text-base">
                    How can I help you today?
                  </p>
                </motion.div>

                {/* Example Queries */}
                <div className="w-full max-w-3xl mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exampleQueries.map((query, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSearch(query)}
                        className="group h-auto py-4 px-5 text-left border border-border/60 rounded-xl hover:bg-secondary/50 transition-colors duration-200 bg-card"
                      >
                        <span className="text-sm text-foreground/90 group-hover:text-foreground">
                          {query}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end mb-6">
                        <div className="bg-primary text-primary-foreground px-5 py-3 rounded-2xl max-w-[80%]">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    ) : (
                      <ResponseCard
                        content={message.content}
                        sources={message.sources}
                      />
                    )}
                  </motion.div>
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
        <div className="border-t border-border/40 bg-background">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Educational purposes only. Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
