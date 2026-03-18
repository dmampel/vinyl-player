import { X } from 'lucide-react';

export default function PlaylistCard({ playlist, currentIndex, handleClearPlaylist, setCurrentIndex, isPlaying, setIsPlaying, handleRemoveTrack }) {
    return (
        <div className="bg-white rounded-[1.2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 overflow-hidden flex flex-col min-h-[150px] w-full sm:w-[320px] md:w-[380px]">
            <div className="flex justify-between items-center p-5 px-6 border-b border-gray-100">
                <h3 className="text-[14px] font-bold text-[#111] pointer-events-none">
                    Playlist <span className="text-gray-400 font-normal ml-1">({playlist.length})</span>
                </h3>
                <button onClick={handleClearPlaylist} className="text-[13px] text-gray-400 hover:text-[#111] transition-colors font-medium pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                    Limpiar
                </button>
            </div>

            <div className="p-2 overflow-y-auto playlist-scroll min-h-[100px] max-h-[300px] pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                {playlist.length === 0 ? (
                    <div className="flex items-center justify-center h-[100px] text-[13px] text-gray-400 font-medium select-none pointer-events-none">
                        Agrega canciones para empezar
                    </div>
                ) : (
                    playlist.map((track, i) => {
                        const isActive = i === currentIndex;
                        return (
                            <div
                                key={i}
                                onClick={() => {
                                    setCurrentIndex(i);
                                    if (!isPlaying) setIsPlaying(true);
                                }}
                                className={`group flex items-center justify-between p-3.5 px-4 rounded-xl cursor-pointer transition-all m-1 ${isActive ? 'bg-[#111] text-white shadow-md' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
                                    {isActive && isPlaying ? (
                                        <div className="flex items-end gap-[2px] h-3 w-3 shrink-0 justify-center">
                                            <div className="w-0.5 bg-white animate-pulse h-full" />
                                            <div className="w-0.5 bg-white animate-pulse delay-75 h-[60%]" />
                                            <div className="w-0.5 bg-white animate-pulse delay-150 h-[80%]" />
                                        </div>
                                    ) : (
                                        <div className="w-3 shrink-0 flex justify-center">
                                            <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-transparent'}`} />
                                        </div>
                                    )}
                                    <span className={`text-[14px] font-semibold truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                        {track.name}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleRemoveTrack(e, i)}
                                    className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity ${isActive ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}