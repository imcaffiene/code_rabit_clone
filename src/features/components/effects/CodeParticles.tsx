"use client"
import { useEffect, useState } from 'react';

const codeSnippets = [
  { code: 'const review = await ai.analyze(pr);', lang: 'typescript' },
  { code: 'git commit -m "feat: add auth"', lang: 'bash' },
  { code: 'function validateCode() { }', lang: 'javascript' },
  { code: 'import { useQuery } from "@tanstack/react-query";', lang: 'typescript' },
  { code: '<Button variant="primary" />', lang: 'jsx' },
  { code: 'export default async function handler(req, res) { }', lang: 'typescript' },
  { code: 'npm run build && npm run deploy', lang: 'bash' },
  { code: 'const [state, setState] = useState(null);', lang: 'typescript' },
  { code: 'await supabase.from("users").select("*");', lang: 'typescript' },
  { code: 'docker compose up -d', lang: 'bash' },
];

interface FloatingSnippet {
  id: number;
  code: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  scale: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export const CodeParticles = () => {
  const [snippets, setSnippets] = useState<FloatingSnippet[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate floating code snippets
    const generatedSnippets: FloatingSnippet[] = codeSnippets.map((snippet, i) => ({
      id: i,
      code: snippet.code,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * -20,
      opacity: 0.03 + Math.random() * 0.04,
      scale: 0.7 + Math.random() * 0.4,
    }));
    setSnippets(generatedSnippets);

    // Generate floating particles/dots
    const generatedParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * -10,
    }));
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating code snippets */}
      {snippets.map((snippet) => (
        <div
          key={snippet.id}
          className="absolute font-mono text-xs sm:text-sm whitespace-nowrap text-primary select-none"
          style={{
            left: `${snippet.x}%`,
            top: `${snippet.y}%`,
            opacity: snippet.opacity,
            transform: `scale(${snippet.scale})`,
            animation: `floatCode ${snippet.duration}s ease-in-out infinite`,
            animationDelay: `${snippet.delay}s`,
          }}
        >
          <span className="bg-secondary/30 px-2 py-1 rounded border border-border/20">
            {snippet.code}
          </span>
        </div>
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: 0.1 + Math.random() * 0.15,
            animation: `floatParticle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* CSS for animations */}
      <style>{`
        @keyframes floatCode {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-30px) translateX(15px) rotate(1deg);
          }
          50% {
            transform: translateY(-15px) translateX(-10px) rotate(-0.5deg);
          }
          75% {
            transform: translateY(-40px) translateX(5px) rotate(0.5deg);
          }
        }
        
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-50px) translateX(20px);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
};