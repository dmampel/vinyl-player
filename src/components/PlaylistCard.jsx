import { X, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

export default function PlaylistCard({ playlist, currentIndex, handleClearPlaylist, setCurrentIndex, isPlaying, setIsPlaying, handleRemoveTrack, handleReorder }) {
    return (
        <div className="bg-white/10 backdrop-blur-xs border border-white rounded-[1.2rem] shadow-[0_8px_32px_0_rgba(0,0,0,10)] overflow-hidden flex flex-col min-h-[150px] w-full sm:w-[320px] md:w-[380px] bg-gradient-to-br from-white/20 to-transparent">
            <div className="flex justify-between items-center p-5 px-6 border-b border-white/20">
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
                    <Reorder.Group axis="y" values={playlist} onReorder={handleReorder} className="flex flex-col gap-1">
                        {playlist.map((track, i) => (
                            <PlaylistItem
                                key={track.id || i}
                                track={track}
                                index={i}
                                isActive={i === currentIndex}
                                isPlaying={isPlaying}
                                setCurrentIndex={setCurrentIndex}
                                setIsPlaying={setIsPlaying}
                                handleRemoveTrack={handleRemoveTrack}
                            />
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </div>
    )
}

function PlaylistItem({ track, index, isActive, isPlaying, setCurrentIndex, setIsPlaying, handleRemoveTrack }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={track}
            dragListener={false}
            dragControls={dragControls}
            className={`group flex items-center justify-between p-3.5 px-4 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-[#111] text-white shadow-md' : 'hover:bg-white/10 text-gray-600'}`}
        >
            <div className="flex items-center gap-3 overflow-hidden w-full" onClick={() => {
                setCurrentIndex(index);
                if (!isPlaying) setIsPlaying(true);
            }}>
                <div
                    onPointerDown={(e) => {
                        e.preventDefault();
                        dragControls.start(e);
                    }}
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-200 transition-colors shrink-0"
                >
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-3 overflow-hidden pointer-events-none">
                    {isActive && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-3 w-3 shrink-0 justify-center mb-0.5">
                            <div className="w-0.5 bg-white animate-pulse h-full" />
                            <div className="w-0.5 bg-white animate-pulse delay-75 h-[60%]" />
                            <div className="w-0.5 bg-white animate-pulse delay-150 h-[80%]" />
                        </div>
                    ) : (
                        <div className="w-3 shrink-0 flex justify-center">
                            <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`} />
                        </div>
                    )}
                    <span className={`text-[14px] font-semibold truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {track.name}
                    </span>
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTrack(index);
                }}
                className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity shrink-0 ${isActive ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
            >
                <X className="w-4 h-4" />
            </button>
        </Reorder.Item>
    );
}