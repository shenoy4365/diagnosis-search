"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cross2Icon } from "@radix-ui/react-icons";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, resetPassword } = useAuth();
  const [fullName, setFullName] = React.useState(
    user?.user_metadata?.full_name || ""
  );
  const [email, setEmail] = React.useState(user?.email || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleResetPassword = async () => {
    if (!email) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Password reset email sent! Check your inbox.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to send reset email" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="bg-card border border-border/40 rounded-xl w-full max-w-md p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Settings
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-secondary"
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Profile Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Profile
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Full Name
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled
                        className="h-10 bg-secondary/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact support to update your name
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Email
                      </label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                        className="h-10 bg-secondary/50"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact support to update your email
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Password
                  </h3>
                  <Button
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-10"
                  >
                    {isLoading ? "Sending..." : "Send Password Reset Email"}
                  </Button>
                </div>

                {/* Message */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`rounded-lg p-3 ${
                      message.type === "success"
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        message.type === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {message.text}
                    </p>
                  </motion.div>
                )}

                {/* Account Info */}
                <div className="pt-4 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    User ID: <span className="font-mono">{user?.id}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
