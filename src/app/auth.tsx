"use client";

import { useState, useEffect } from "react";
import { AuthForm } from "@/components/ui/auth-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function Auth() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [randomQuote, setRandomQuote] = useState('');

  // Helper to determine if we need to set initial mode
  useEffect(() => {
    // Set the mode initially based on URL
    const modeParam = searchParams.get("mode");
    if (modeParam === "register" || modeParam === "login") {
      setMode(modeParam);
    }
    
    // Set a professional tagline for login page
    if (modeParam === "login" || !modeParam) {
      const taglines = [
        "Enterprise knowledge management solution.",
        "Secure document infrastructure for businesses.",
        "Streamline information workflows.",
        "Optimize enterprise data accessibility.",
        "Advanced information architecture platform."
      ];
      setRandomQuote(taglines[Math.floor(Math.random() * taglines.length)]);
    }
  }, [searchParams]);

  const toggleMode = (newMode: "login" | "register") => {
    setMode(newMode);
    // This function is kept for backward compatibility
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Beta warning banner */}
      <div className="w-full bg-status-warning-subtle py-1 text-center">
        <p className="text-xs font-light text-status-warning">
          <span className="font-medium">BETA VERSION</span> — Not for production use. Data may be reset at any time.
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4">
        {mode === "login" ? (
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-light text-brand-primary tracking-tight">
                Infinity
              </h1>
              <p className="text-sm text-text-secondary mt-2 italic">
                {randomQuote}
              </p>
            </div>

            {/* Authentication form */}
            <AuthForm mode={mode} />

            {/* Mode toggle link */}
            <div className="text-center text-sm font-light text-text-secondary mt-6">
              <p>
                Need an account?{" "}
                <Link
                  href="/auth?mode=register"
                  className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-3">
              <h1 className="text-3xl font-light text-brand-primary tracking-tight">
                Infinity
              </h1>
            </div>
            
            {/* Typewriter-style intro - reduced height */}
            <div className="mb-3 p-3 bg-surface-1 rounded border border-border-primary text-sm leading-tight text-text-secondary" 
                 style={{ 
                   fontFamily: "'Courier New', Courier, monospace",
                   letterSpacing: '0.05em',
                   lineHeight: '1.3',
                   textAlign: 'left'
                 }}>
              <p>The predictable core bringing structure to your automation journey.</p>
              
            </div>

            {/* Authentication form */}
            <AuthForm mode={mode} />

            {/* Mode toggle link */}
            <div className="text-center text-sm font-light text-text-secondary mt-3">
              <p>
                Already have an account?{" "}
                <Link
                  href="/auth?mode=login"
                  className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
