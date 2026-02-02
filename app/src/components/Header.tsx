'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';
import { LaunchModal } from './LaunchModal';

export function Header() {
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  return (
    <>
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white">
              AF
            </div>
            <span className="font-bold text-xl tracking-tight">AgentFi</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Market</a>
              <a href="#" className="hover:text-white transition-colors">Portfolio</a>
              <button 
                onClick={() => setIsLaunchModalOpen(true)}
                className="hover:text-white transition-colors"
              >
                Launch
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button 
                            onClick={openConnectModal} 
                            type="button"
                            className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors"
                          >
                            Connect Wallet
                          </button>
                        );
                      }
                      if (chain.unsupported) {
                        return (
                          <button 
                            onClick={openChainModal} 
                            type="button"
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
                          >
                            Wrong Network
                          </button>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            onClick={openChainModal}
                            style={{ display: 'flex', alignItems: 'center' }}
                            type="button"
                            className="bg-zinc-800 text-white px-3 py-2 rounded-lg text-xs font-mono border border-white/10"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: 'hidden',
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? 'Chain icon'}
                                    src={chain.iconUrl}
                                    style={{ width: 12, height: 12 }}
                                  />
                                )}
                              </div>
                            )}
                            {chain.name}
                          </button>
                          <button 
                            onClick={openAccountModal} 
                            type="button"
                            className="bg-zinc-800 text-white px-3 py-2 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-2"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {account.displayName}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </header>

      {isLaunchModalOpen && (
        <LaunchModal onClose={() => setIsLaunchModalOpen(false)} />
      )}
    </>
  );
}
