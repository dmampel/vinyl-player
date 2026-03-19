import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

export default function ControlsCard({ currentTrack, currentTime, duration, formatTime, progress, handleSeek, handleVolumeChange, volume, playPrev, togglePlay, playNext, isPlaying, playlist }) {
    return (
        <div className="bg-white/10 backdrop-blur-xs border border-white rounded-[1.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,10)] p-6 px-8 w-full sm:w-[320px] md:w-[380px] bg-gradient-to-br from-white/20 to-transparent">
            {/* Progress */}
            <div className="mb-6 flex items-center gap-4">
                <span className="text-[11px] font-bold text-gray-400 w-10 text-left pointer-events-none">{formatTime(currentTime)}</span>
                <div className="relative flex-1 h-1 bg-gray-100 rounded-full cursor-pointer pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                    <div className="absolute top-0 left-0 h-full bg-[#111] rounded-full pointer-events-none" style={{ width: `${progress || 0}%` }} />
                    <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-[#111] rounded-full shadow pointer-events-none" style={{ left: `calc(${(progress || 0)}% - 4px)` }} />
                    <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <span className="text-[11px] font-bold text-gray-400 w-10 text-right pointer-events-none">{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between mb-6 px-2 pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                <button className="text-gray-400 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all duration-300"><Shuffle className="w-4 h-4" /></button>
                <div className="flex items-center gap-6">
                    <button onClick={playPrev} className="text-gray-600 hover:text-black cursor-pointer hover:scale-150 transition-all duration-300 disabled:opacity-30" disabled={playlist.length === 0}><SkipBack className="w-5 h-5 fill-current" /></button>
                    <button onClick={togglePlay} className="w-14 h-14 bg-[#111] text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300shadow-[0_10px_20px_rgba(0,0,0,0.2)] disabled:opacity-50" disabled={playlist.length === 0}>
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    <button onClick={playNext} className="text-gray-600 hover:text-black cursor-pointer hover:scale-150 transition-all duration-300 disabled:opacity-30" disabled={playlist.length === 0}><SkipForward className="w-5 h-5 fill-current" /></button>
                </div>
                <button className="text-gray-400 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all duration-300"><Repeat className="w-4 h-4" /></button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-4 w-[60%] mx-auto justify-center pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                <Volume2 className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                <div className="relative flex-1 h-1 bg-gray-100 rounded-full cursor-pointer">
                    <div className="absolute top-0 left-0 h-full bg-[#111] rounded-full pointer-events-none" style={{ width: `${volume * 100}%` }} />
                    <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-[#111] rounded-full shadow pointer-events-none" style={{ left: `calc(${volume * 100}% - 4px)` }} />
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}