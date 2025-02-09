'use client';

import React from 'react';
import { AuthForm } from '@/components/ui/auth-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-text-primary">
          Create Account
        </h1>
        <h2 className="mt-3 text-center text-2xl font-semibold text-text-primary">
          Get started with Infinity
        </h2>
      </div>

      <div className="mt-8">
        <AuthForm mode="register" />
        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="text-sm text-primary hover:text-primary-hover transition-colors duration-200"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 