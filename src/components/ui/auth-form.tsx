'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AuthFormProps {
  mode: 'login' | 'register';
}

interface ValidationError {
  field?: string;
  message: string;
}

// Helper to format error message
const formatErrorMessage = (error: ValidationError) => {
  if (!error.field) return error.message;
  
  // Capitalize field name and format message
  const fieldName = error.field.charAt(0).toUpperCase() + error.field.slice(1);
  return `${fieldName}: ${error.message}`;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<ValidationError | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = mode === 'login'
      ? {
          username: formData.get('username') as string,
          password: formData.get('password') as string,
        }
      : {
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          name: formData.get('name') as string,
          password: formData.get('password') as string,
        };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          if (typeof result.error === 'object' && result.error.field) {
            setError(result.error as ValidationError);
          } else {
            setError({ message: result.error });
          }
          return;
        }
        throw new Error('Authentication failed');
      }

      // Get the from parameter and redirect accordingly
      const from = searchParams.get('from');
      const redirectTo = from || '/dashboard';
      router.replace(redirectTo);
    } catch (err) {
      setError({ 
        message: err instanceof Error ? err.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to get input error state
  const getInputErrorClass = (fieldName: string) => 
    error?.field === fieldName 
      ? 'border-status-error focus:border-status-error' 
      : 'border-transparent focus:border-brand-primary/20';

  const inputClasses = "w-full px-4 py-2 mb-3 text-sm bg-surface-1 border-b border-border-primary placeholder-text-tertiary text-text-primary focus:outline-none focus:ring-0 transition-colors duration-200";

  return (
    <div>
      <form className="space-y-1" onSubmit={handleSubmit}>
        {/* Username */}
        <div className="relative">
          <input
            id="username"
            name="username"
            type="text"
            required
            className={`${inputClasses} ${getInputErrorClass('username')}`}
            placeholder="Username"
          />
          <div className="absolute right-3 top-3 text-text-tertiary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>

        {/* Email and Name - Only for Register */}
        {mode === 'register' && (
          <>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`${inputClasses} ${getInputErrorClass('email')}`}
                placeholder="Email address"
              />
              <div className="absolute right-3 top-3 text-text-tertiary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>

            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`${inputClasses} ${getInputErrorClass('name')}`}
                placeholder="Full name"
              />
              <div className="absolute right-3 top-3 text-text-tertiary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
          </>
        )}

        {/* Password */}
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            className={`${inputClasses} ${getInputErrorClass('password')}`}
            placeholder="Password"
          />
          <div className="absolute right-3 top-3 text-text-tertiary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs font-light text-status-error pt-1 pb-2">
            {formatErrorMessage(error)}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-3 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-base bg-brand-primary hover:bg-brand-primary/90 px-8 py-2 text-xs text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-full shadow-sm hover:shadow-md"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              mode === 'login' ? 'Log In' : 'Register'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}