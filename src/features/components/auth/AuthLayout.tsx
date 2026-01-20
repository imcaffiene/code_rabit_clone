'use client';

import { ReactNode } from 'react';
import { Code2, GitBranch, Shield, Zap } from 'lucide-react';
import { CodeParticles } from '../effects/CodeParticles';
import { ThemeSwitcher } from '@/provider/ThemeSwitcher';


interface AuthLayoutProps {
  children: ReactNode;
}

const features = [
  {
    icon: Code2,
    title: 'AI-Powered Code Reviews',
    description: 'Get instant, intelligent feedback on every pull request',
  },
  {
    icon: GitBranch,
    title: 'Seamless Git Integration',
    description: 'Works with GitHub, GitLab, and Bitbucket repositories',
  },
  {
    icon: Shield,
    title: 'Security First',
    description: 'Identify vulnerabilities before they reach production',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Reviews complete in seconds, not hours',
  },
];

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex overflow-hidden grid-background">
      <CodeParticles />

      {/* Left Side - Marketing Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-12 max-lg:hidden">
        <div className="max-w-xl space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Code2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CodeRabbit</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Ship Better Code,{' '}
              <span className="text-primary">Faster.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              AI-powered code reviews that help your team write cleaner, more secure, and maintainable code.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 pt-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
