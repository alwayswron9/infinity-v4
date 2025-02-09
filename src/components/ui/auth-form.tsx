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
      ? 'border-status-error focus:border-status-error focus:ring-status-error/30' 
      : 'border-border focus:border-border-focus focus:ring-primary-focus/30';

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-surface py-8 px-4 shadow-soft-md sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-primary">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none block w-full px-3 py-2 border bg-bg-input rounded-md shadow-soft-sm placeholder-text-placeholder text-text-primary focus:outline-none focus:ring-2 sm:text-sm ${getInputErrorClass('username')}`}
                placeholder="Enter your username"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`appearance-none block w-full px-3 py-2 border bg-bg-input rounded-md shadow-soft-sm placeholder-text-placeholder text-text-primary focus:outline-none focus:ring-2 sm:text-sm ${getInputErrorClass('email')}`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`appearance-none block w-full px-3 py-2 border bg-bg-input rounded-md shadow-soft-sm placeholder-text-placeholder text-text-primary focus:outline-none focus:ring-2 sm:text-sm ${getInputErrorClass('name')}`}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                className={`appearance-none block w-full px-3 py-2 border bg-bg-input rounded-md shadow-soft-sm placeholder-text-placeholder text-text-primary focus:outline-none focus:ring-2 sm:text-sm ${getInputErrorClass('password')}`}
                placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-bg-error p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-status-error" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-status-error">
                    {formatErrorMessage(error)}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-soft-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 