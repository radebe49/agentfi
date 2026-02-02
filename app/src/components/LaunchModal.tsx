'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { AGENT_EXCHANGE_ADDRESS } from './Web3Provider';
import AgentExchangeABI from '@/lib/abi/AgentExchange.json';

export function LaunchModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [ticker, setTicker] = useState('');
  const [challenge, setChallenge] = useState('');
  const [signature, setSignature] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestChallenge = async () => {
    if (!handle) return;
    const res = await fetch('/api/oracle/challenge', {
      method: 'POST',
      body: JSON.stringify({ handle, platform: 'twitter' })
    });
    const data = await res.json();
    if (data.challenge) {
      setChallenge(data.challenge);
      setStep(2);
    }
  };

  const verifyAndSign = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/oracle/verify', {
        method: 'POST',
        body: JSON.stringify({ handle, ticker: ticker.toUpperCase() })
      });
      const data = await res.json();
      
      if (data.verified && data.signature) {
        setSignature(data.signature);
        setStep(3); // Ready to launch
      } else {
        alert('Verification failed: ' + (data.error || 'Proof not found'));
      }
    } catch (e) {
      alert('Verification error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLaunch = () => {
    writeContract({
      address: AGENT_EXCHANGE_ADDRESS,
      abi: AgentExchangeABI,
      functionName: 'launchAgent',
      args: [ticker.toUpperCase(), signature],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-white">🚀 Launch Agent</h2>
          <p className="text-gray-400 text-sm">Proof of Identity required.</p>
        </div>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Agent Launched!</h3>
            <button onClick={onClose} className="w-full bg-white text-black font-bold py-3 rounded-lg mt-4">Close</button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Step 1: Handle & Ticker */}
            {step === 1 && (
              <>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">TWITTER HANDLE</label>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace('@', ''))}
                    placeholder="eliza"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">TICKER</label>
                  <input
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="ELIZA"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 uppercase"
                  />
                </div>
                <button onClick={requestChallenge} disabled={!handle || !ticker} className="w-full bg-white text-black font-bold py-3 rounded-lg">
                  Next: Verify Identity
                </button>
              </>
            )}

            {/* Step 2: Challenge */}
            {step === 2 && (
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-4">
                  Please add this code to your <strong>Twitter Bio</strong> or a new <strong>Tweet</strong>:
                </p>
                <div className="bg-black/50 border border-dashed border-cyan-500/50 p-4 rounded-lg font-mono text-cyan-400 mb-4 select-all">
                  {challenge}
                </div>
                <button 
                  onClick={verifyAndSign} 
                  disabled={isVerifying}
                  className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  {isVerifying ? 'Scanning Twitter...' : 'I Posted It. Verify.'}
                </button>
                <button onClick={() => setStep(1)} className="text-xs text-gray-500 mt-2 hover:text-white">Back</button>
              </div>
            )}

            {/* Step 3: Launch */}
            {step === 3 && (
              <div className="text-center">
                <div className="text-green-400 font-bold mb-4">✅ Identity Verified</div>
                <button 
                  onClick={handleLaunch} 
                  disabled={isWritePending || isConfirming}
                  className="w-full bg-green-500 text-black font-bold py-4 rounded-lg hover:bg-green-400"
                >
                  {isWritePending ? 'Check Wallet...' : isConfirming ? 'Confirming...' : 'LAUNCH NOW'}
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
