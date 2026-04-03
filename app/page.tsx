"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { ResponseCard } from "@/components/ResponseCard";
import { SettingsModal } from "@/components/SettingsModal";
import { AuthModal } from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { SourceCardProps } from "@/components/SourceCard";
import { HamburgerMenuIcon, GearIcon, ExitIcon, PersonIcon } from "@radix-ui/react-icons";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCardProps[];
  timestamp: Date;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async (query: string) => {
    // Check if user is authenticated
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create temporary AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const tempAiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;

        // Update the message content with accumulated text
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? { ...m, content: accumulatedContent }
              : m
          )
        );
      }

      // After streaming is complete, add sources
      // TODO: Extract actual sources from the response in the future
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                sources: [
                  {
                    title: "Medical Research",
                    url: "https://www.ncbi.nlm.nih.gov",
                    snippet: "Evidence-based medical information",
                    domain: "ncbi.nlm.nih.gov",
                    credibilityScore: 98,
                  },
                ],
              }
            : m
        )
      );
    } catch (error) {
      console.error("Search error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                content:
                  "Sorry, I encountered an error processing your request. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
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
            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className="h-8 gap-2 px-3"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <GearIcon className="h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className="h-8 gap-2 px-3"
                    onClick={signOut}
                  >
                    <ExitIcon className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="default"
                  className="h-8 gap-2 px-3"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <PersonIcon className="h-4 w-4" />
                  <span className="text-sm">Sign in</span>
                </Button>
              </motion.div>
            )}
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
                    {user
                      ? `Good afternoon${user.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}`
                      : "Welcome to Diagnosis AI"}
                  </h1>
                  <p className="text-muted-foreground text-base">
                    {user
                      ? "How can I help you today?"
                      : "AI-powered healthcare search. Sign in to get started."}
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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
