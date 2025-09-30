import React, { useEffect, useState } from "react";
import EnhancedWalletConnector from "../components/ui/enhanced-wallet-connector";
import WalletTest from "../components/WalletTest";
import TutorialModal from "../components/TutorialModal";
import QuickStartGuide from "../components/QuickStartGuide";
import GameChatbot from "../components/GameChatbot";

const Index = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Smooth scrolling for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
      const element = el as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="navbar fixed top-0 w-full px-8 py-6 flex justify-between items-center bg-background/95 backdrop-blur-md z-50 transition-all duration-300">
        <div className="flex items-center gap-3 text-2xl font-black">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
            AR
          </div>
          <span className="avalanche-title">Avalanche Rush</span>
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#features" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Features</a>
          <a href="#modes" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Game Modes</a>
          <a href="/play" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Play Now</a>
        <a href="/reactive-quest" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Reactive Quest</a>
        <a href="/interactive-learning" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Interactive Learning</a>
        <a href="/enhanced-rewards" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Enhanced Rewards</a>
        <a href="#about" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">About</a>
        </div>
        <a href="/play" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-3 rounded-full font-semibold hover:shadow-glow hover:-translate-y-1 transition-all duration-300">
          Play Free
        </a>
      </nav>

      {/* Quick Start Guide Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <QuickStartGuide />
        </div>
      </section>

      {/* Wallet Test Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <WalletTest />
        </div>
      </section>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-8 pt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-black leading-tight avalanche-title">
              Learn Web3 Skills While Chasing High Scores
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The first learn-to-earn arcade game that bridges Web2 fun with Web3 ownership. Play, learn, and earn real rewards seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => setShowTutorial(true)}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-full font-semibold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 justify-center"
              >
                <span>▶</span> Learn How to Play
              </button>
              <a href="/play" className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold hover:bg-primary/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 justify-center">
                <span>🎮</span> Start Gaming
              </a>
            </div>
            <div className="flex gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15,000+</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">$250K+</div>
                <div className="text-sm text-muted-foreground">Rewards Distributed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">Player Rating</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-lg h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl overflow-hidden shadow-ice relative border border-border/20">
              <div className="absolute inset-0 flex items-center justify-center flex-col p-8">
                <div className="absolute top-8 w-full flex justify-around">
                  <div className="w-5 h-5 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-5 h-5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-5 h-5 bg-accent rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
                <div className="w-16 h-20 bg-primary rounded-lg relative animate-pulse mb-8">
                  <div className="absolute top-4 left-2 right-2 h-5 bg-foreground rounded"></div>
                </div>
                <div className="absolute bottom-0 w-full flex justify-around">
                  <div className="w-8 h-10 bg-secondary rounded"></div>
                  <div className="w-8 h-10 bg-secondary rounded"></div>
                  <div className="w-8 h-10 bg-secondary rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-8 bg-card/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 avalanche-title">
              Why Players Love Avalanche Rush
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of gaming where your skills translate into real value
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 text-center hover:-translate-y-2 hover:bg-card/70 hover:shadow-glow transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                💎
              </div>
              <h3 className="text-xl font-bold mb-4">True Ownership</h3>
              <p className="text-muted-foreground leading-relaxed">
                Earn NFTs and tokens that you truly own. Trade, sell, or use them across the Avalanche ecosystem.
              </p>
            </div>
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 text-center hover:-translate-y-2 hover:bg-card/70 hover:shadow-glow transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-4">Zero Friction</h3>
              <p className="text-muted-foreground leading-relaxed">
                Web2 players enjoy seamless gameplay with email signup, while Web3 enthusiasts get full control.
              </p>
            </div>
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl p-8 text-center hover:-translate-y-2 hover:bg-card/70 hover:shadow-glow transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                🏆
              </div>
              <h3 className="text-xl font-bold mb-4">Tournament Ready</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compete in global tournaments on Funtico with real prize pools and live leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section id="modes" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 avalanche-title">
              Multiple Ways to Play & Earn
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose your adventure and start earning today
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-glow transition-all duration-300">
              <div className="bg-gradient-to-r from-primary to-accent p-8 text-center">
                <h3 className="text-2xl font-bold">Adventure Mode</h3>
                <p>Learn Web3 Fundamentals</p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Progressive quest system
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Educational content
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> NFT rewards for completion
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Perfect for beginners
                  </li>
                </ul>
                <a href="/learn-web3" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full font-semibold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 block text-center">
                  Start Learning
                </a>
              </div>
            </div>
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-glow transition-all duration-300">
              <div className="bg-gradient-to-r from-primary to-accent p-8 text-center">
                <h3 className="text-2xl font-bold">Tournament Mode</h3>
                <p>Compete for Real Prizes</p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Global leaderboards
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Cash and crypto prizes
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Live events
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Skill-based matchmaking
                  </li>
                </ul>
                <a href="/play" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full font-semibold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 block text-center">
                  Join Tournament
                </a>
              </div>
            </div>
            <div className="animate-on-scroll bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl overflow-hidden hover:-translate-y-2 hover:shadow-glow transition-all duration-300">
              <div className="bg-gradient-to-r from-primary to-accent p-8 text-center">
                <h3 className="text-2xl font-bold">Collection Mode</h3>
                <p>Build Your Digital Empire</p>
              </div>
              <div className="p-8">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Rare NFT collectibles
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Trading marketplace
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Collection bonuses
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-primary">✓</span> Social features
                  </li>
                </ul>
                <a href="/play" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-full font-semibold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 block text-center">
                  View Collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="play" className="py-24 px-8 bg-gradient-to-br from-primary/10 to-accent/10 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-6xl font-black mb-6 avalanche-title">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            Join thousands of players already earning while playing. No experience required.
          </p>
          <a href="/play" className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-12 py-5 rounded-full font-bold text-xl hover:shadow-glow hover:-translate-y-2 transition-all duration-300 inline-flex items-center gap-4">
            🚀 Launch Game Now
          </a>
          <p className="mt-6 text-muted-foreground">
            No download required • Play instantly in your browser
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/80 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          <div>
            <div className="flex items-center gap-3 text-2xl font-black mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                AR
              </div>
              <span className="avalanche-title">Avalanche Rush</span>
            </div>
            <p className="text-muted-foreground mb-6">
              The premier learn-to-earn arcade game on Avalanche. Bridging Web2 fun with Web3 ownership.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300">
                🐦
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300">
                💬
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300">
                📺
              </a>
              <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center hover:bg-primary hover:-translate-y-1 transition-all duration-300">
                📱
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Game Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Play Now</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Tournaments</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Leaderboard</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Marketplace</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Wiki</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Partners</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Cookie Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary hover:pl-2 transition-all duration-300">Disclaimer</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-border text-muted-foreground text-sm">
          <p>&copy; 2024 Avalanche Rush. All rights reserved. | Built on Avalanche • Powered by Funtico</p>
        </div>
      </footer>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Chatbot */}
      <GameChatbot />
    </div>
  );
};

export default Index;