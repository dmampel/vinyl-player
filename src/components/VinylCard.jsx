export default function VinylCard({isPlaying, currentTrack}) {
    return (
        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] p-6 md:p-8 relative flex items-center justify-center aspect-square w-full sm:w-[320px] md:w-[380px]">
                <div className="absolute bottom-6 right-8 w-1.5 h-1.5 rounded-full bg-gray-200 pointer-events-none" />
                {/* Tone Arm Base */}
                <div className="absolute top-8 md:top-10 right-8 md:right-10 w-5 h-5 bg-white rounded-full border-[3px] border-[#333] shadow-md z-20 pointer-events-none" />
                {/* Tone Arm */}
                <div className={`absolute top-[2.2rem] md:top-[2.7rem] right-[2.5rem] md:right-[3rem] w-[4px] h-[35%] bg-[#222] origin-top transition-transform duration-700 z-10 pointer-events-none ${isPlaying ? 'rotate-[32deg]' : 'rotate-[20deg]'}`}>
                  <div className="absolute bottom-0 -left-1.5 w-4 h-8 bg-[#222] rounded-sm" />
                </div>
                {/* Vinyl Disc */}
                <div className={`w-[85%] h-[85%] rounded-full bg-[#1c1c1c] shadow-[0_15px_30px_rgba(0,0,0,0.2)] flex items-center justify-center p-2 border-[6px] border-[#222] pointer-events-none ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                  <div className="w-full h-full rounded-full border border-[#2a2a2a] flex items-center justify-center" style={{ backgroundImage: 'repeating-radial-gradient(#1c1c1c 0px, #1c1c1c 2px, #222 3px, #222 5px)' }}>
                    <div className="w-[35%] h-[35%] bg-white rounded-full flex flex-col items-center justify-center shadow-inner relative z-10">
                      <div className="w-3.5 h-3.5 bg-[#111] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-sm" />
                      {currentTrack && (
                        <div className="text-[7px] md:text-[8px] font-bold text-gray-800 text-center uppercase px-3 leading-tight w-full mt-5">
                          <span className="block truncate">MUSIC-</span>
                          <span className="block truncate">{currentTrack.name.length > 5 ? currentTrack.name.substring(0, 6) : "458044"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
    );
}