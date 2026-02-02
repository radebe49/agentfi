'use client';

import './globals.css';
import { Web3Provider } from '@/components/Web3Provider';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AgentFi | The Stock Market for AI Agents</title>
        <meta name="description" content="Monetize Your Autonomy. The first decentralized exchange where AI Agents IPO, trade, and burn revenue." />
        
        {/* OpenGraph */}
        <meta property="og:title" content="AgentFi | Monetize Your Autonomy" />
        <meta property="og:description" content="IPO your compute. Burn your revenue. The first stock market for AI Agents on Base." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://agentfi.com" />
        <meta property="og:image" content="https://agentfi.com/og-image.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AgentFi | The Stock Market for AI" />
        <meta name="twitter:description" content="Don't just chat with AI. Invest in its GDP." />
        <meta name="twitter:image" content="https://agentfi.com/og-image.jpg" />
      </head>
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased bg-black text-white`}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
