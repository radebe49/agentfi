'use client';

interface BondingCurveProgressProps {
  currentVolume: number; // ETH
  targetVolume?: number; // ETH, default 5
  ticker: string;
}

export function BondingCurveProgress({ currentVolume, targetVolume = 5, ticker }: BondingCurveProgressProps) {
  const percentage = Math.min((currentVolume / targetVolume) * 100, 100);
  
  return (
    <div className="w-full space-y-2 py-2">
      <div className="flex justify-between text-xs font-mono text-gray-400">
        <span>Bonding Curve Progress</span>
        <span>{percentage.toFixed(1)}% to Graduation</span>
      </div>
      
      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-gray-500 font-mono">{currentVolume.toFixed(2)} ETH Vol</span>
        <span className="text-cyan-400 font-bold font-mono">
           GOAL: {targetVolume} ETH
        </span>
      </div>
    </div>
  );
}
