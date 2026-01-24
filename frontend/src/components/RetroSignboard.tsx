import React from 'react';

const RetroSignboard: React.FC = () => {
  return (
    <div className="relative group">
      {/* 3D Depth Shadow behind the board */}
      <div className="absolute inset-0 bg-red-900 rounded-xl translate-y-2 translate-x-1"></div>
      
      {/* Main Board Container (The Red Frame) */}
      <div className="relative bg-red-600 p-3 pb-4 px-4 rounded-xl shadow-2xl border-2 border-red-400 flex flex-col items-center justify-center transform transition-transform hover:scale-105 duration-300">
        
        {/* Bulbs Container - Absolute positioned dots */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            {/* Top Row Bulbs */}
            <div className="absolute top-1 left-2 right-2 flex justify-between px-1">
                {[...Array(12)].map((_, i) => (
                    <div key={`t-${i}`} className="w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_2px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Bottom Row Bulbs */}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between px-1">
                {[...Array(12)].map((_, i) => (
                    <div key={`b-${i}`} className="w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_2px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
             {/* Left Col Bulbs */}
             <div className="absolute top-2 bottom-2 left-1 flex flex-col justify-between py-2">
                {[...Array(4)].map((_, i) => (
                    <div key={`l-${i}`} className="w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_2px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
            {/* Right Col Bulbs */}
             <div className="absolute top-2 bottom-2 right-1 flex flex-col justify-between py-2">
                {[...Array(4)].map((_, i) => (
                    <div key={`r-${i}`} className="w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_10px_2px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
            </div>
        </div>

        {/* Inner Dark Board (Neon Style) */}
        <div className="bg-neutral-900 w-full py-6 px-10 md:px-16 rounded-lg shadow-[inset_0_2px_15px_rgba(0,0,0,1)] border-4 border-gray-800 relative overflow-hidden">
            
            {/* Subtle Grid Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Neon Text Content */}
            <div className="text-center relative z-10">
                {/* ACUHIN - Blue/Cyan Neon */}
                <h2 className="text-5xl md:text-7xl font-black tracking-widest uppercase font-sans mb-2 transition-all duration-100"
                    style={{ 
                        color: '#E0F2FE', // Light blue core
                        textShadow: '0 0 5px #0EA5E9, 0 0 10px #0EA5E9, 0 0 20px #0284C7, 0 0 40px #0284C7',
                        animation: 'flicker 3s infinite alternate' 
                    }}>
                    ACUHIN
                </h2>

                {/* Separator - Pink/Red Neon Line */}
                <div className="h-1 w-[60%] mx-auto bg-pink-500 rounded-full mb-3 shadow-[0_0_10px_#EC4899,0_0_20px_#DB2777]"></div>

                {/* Grocery Store - Pink/White Neon */}
                <h3 className="text-xl md:text-2xl font-bold text-pink-100 tracking-[0.3em] uppercase font-mono"
                    style={{ 
                        textShadow: '0 0 5px #F472B6, 0 0 10px #DB2777, 0 0 20px #BE185D' 
                    }}>
                    Grocery Store
                </h3>

                {/* Flicker Animation Keyframes via Style tag since Tailwind config is static */}
                <style>{`
                    @keyframes flicker {
                        0%, 18%, 22%, 25%, 53%, 57%, 100% {
                            opacity: 1;
                            text-shadow: 0 0 5px #0EA5E9, 0 0 10px #0EA5E9, 0 0 20px #0284C7, 0 0 40px #0284C7;
                        }
                        20%, 24%, 55% {       
                            opacity: 0.8;
                            text-shadow: none;
                        }
                    }
                `}</style>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RetroSignboard;
