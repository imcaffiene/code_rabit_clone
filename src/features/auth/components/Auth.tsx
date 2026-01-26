'use client';

import { useState } from 'react';
import { Code2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ThemeSwitcher } from '@/provider/ThemeSwitcher';
import { GitHubButton } from './GitHubButton';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';

type AuthMode = 'login' | 'signup';

const Auth = ({ mode: initialMode = 'login' }: { mode?: AuthMode; }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { authenticateWithGitHub, isLoading, error, clearError } = useAuth();

  const toggleMode = () => {
    clearError();
    setMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  return (
    <AuthLayout>
      {/* Mobile Logo + Theme Switcher */}
      <div className="flex items-center justify-between mb-8 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">CodeRabbit</span>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Auth Card */}
      <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to continue to CodeRabbit'
              : 'Start your free trial today'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* GitHub Auth Button */}
        <GitHubButton
          onClick={authenticateWithGitHub}
          isLoading={isLoading}
          variant={mode}
        />

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">GitHub only</span>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === 'login'
            ? 'We use GitHub to authenticate and access your repositories for code reviews.'
            : 'By signing up, you agree to our Terms of Service and Privacy Policy.'}
        </p>

        {/* Toggle Mode */}
        <div className="text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Auth;
