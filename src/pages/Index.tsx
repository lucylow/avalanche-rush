import { useEffect, useState } from "react";

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 glow-orb rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 glow-orb rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 glow-orb rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-ice-blue/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 text-center px-4">
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="avalanche-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-tight mb-8 animate-float">
            AVALANCHE
          </h1>
          <h2 className="avalanche-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
            RUSH
          </h2>
        </div>

        {/* Subtle glow effect behind text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-4xl h-64 bg-gradient-to-r from-transparent via-crypto-glow/20 to-transparent blur-3xl" />
        </div>
      </main>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-avalanche-blue/50" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-rush-purple/50" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-rush-purple/50" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-avalanche-blue/50" />
    </div>
  );
};

export default Index;