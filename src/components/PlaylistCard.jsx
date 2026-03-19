import React, { useEffect, useRef } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import PlaylistItem from './PlaylistItem';

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

            <div className="p-2 overflow-y-auto playlist-scroll min-h-[100px] max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-150px)] pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
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

