import React, { useEffect, useRef } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
export default function PlaylistItem({ track, index, isActive, isPlaying, setCurrentIndex, setIsPlaying, handleRemoveTrack }) {
    const dragControls = useDragControls();
    const itemRef = useRef(null);

    useEffect(() => {
        if (isActive && itemRef.current) {
            itemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [isActive]);

    return (
        <Reorder.Item
            ref={itemRef}
            value={track}
            dragListener={false}
            dragControls={dragControls}
            className={`group flex items-center justify-between p-3.5 px-4 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-[#111] text-white shadow-md cursor-pointer hover:scale-95 transition-all duration-300' : 'cursor-pointer hover:scale-90 transition-all duration-300'}`}
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
                    <span className={`text-[14px] font-semibold truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
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
                <X className="w-4 h-4 cursor-pointer hover:rotate-90 transition-all duration-300" />
            </button>
        </Reorder.Item>
    );
}