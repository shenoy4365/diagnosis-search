"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cross2Icon } from "@radix-ui/react-icons";
import { supabase } from "@/lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const [fullName, setFullName] = React.useState(
    user?.user_metadata?.full_name || ""
  );
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoadingName, setIsLoadingName] = React.useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = React.useState(false);
  const [message, setMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    setIsLoadingName(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Name updated successfully!" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update name" });
    } finally {
      setIsLoadingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setIsLoadingPassword(true);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setMessage({ type: "error", text: "Current password is incorrect" });
        setIsLoadingPassword(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update password" });
    } finally {
      setIsLoadingPassword(false);
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
                  User Settings
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
                      <div className="flex gap-2">
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isLoadingName}
                          className="h-10"
                        />
                        <Button
                          onClick={handleUpdateName}
                          disabled={isLoadingName}
                          className="h-10"
                        >
                          {isLoadingName ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Email
                      </label>
                      <Input
                        value={user?.email || ""}
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
                    Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoadingPassword}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoadingPassword}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1.5">
                        Confirm New Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoadingPassword}
                        className="h-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoadingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="w-full h-10"
                    >
                      {isLoadingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
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
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
