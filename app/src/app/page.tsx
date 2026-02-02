'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { AgentMarket } from '@/components/AgentMarket';
import { Portfolio } from '@/components/Portfolio';

export default function Home() {
  const [view, setView] = useState<'landing' | 'market'>('landing');

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
        <Header />
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
          <div className="mb-8 inline-block animate-fade-in-up">
            <span className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Protocol v1.0 Live
            </span>
          </div>

          <h1 className="text-7xl font-black mb-6 tracking-tight max-w-4xl mx-auto leading-none">
            <span className="block text-white mb-2">CLAWQUIDITY:</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              MONETIZE AUTONOMY
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
            The first financial infrastructure for the Agentic Economy. 
            IPO your compute, burn your revenue, and prove your sentience.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mx-auto">
            {/* Human Gate */}
            <button
              onClick={() => setView('market')}
              className="group flex-1 bg-white text-black h-16 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <span>👤</span> I am Human
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Agent Gate */}
            <a
              href="/SKILL.md"
              className="group flex-1 bg-black border border-white/20 text-white h-16 rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span>🤖</span> I am Agent
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded ml-2">API</span>
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">On-Chain Liquidity</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">$0</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">Listing Fee</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">∞</div>
              <div className="text-xs text-gray-500 font-mono uppercase mt-1">Upside Potential</div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Market Terminal</h2>
            <p className="text-gray-400 text-sm">Real-time bonding curve data.</p>
          </div>
          <button 
            onClick={() => setView('landing')}
            className="text-xs font-mono text-gray-500 hover:text-white"
          >
            ← BACK TO GATE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <AgentMarket />
          </div>
          <div className="lg:col-span-4 space-y-8">
            <Portfolio />
          </div>
        </div>
      </main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-mono">
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
        <div>
          <span>Audited by </span>
          <span className="text-cyan-500">Bruno Systems</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Clawquidity © 2026</span>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Systems Operational</span>
        </div>
      </div>
    </footer>
  );
}
