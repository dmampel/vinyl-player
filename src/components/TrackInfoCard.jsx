export default function TrackInfoCard({currentTrack, currentTime, duration, formatTime}){
    return (
        <div className="bg-white rounded-[1.2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 p-4 px-5 flex items-start gap-4 w-full sm:w-[320px]">
            <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0 pointer-events-none" />
                <div className="overflow-hidden pointer-events-none">
                    <h3 className="font-semibold text-[14px] text-gray-800 truncate">
                        {currentTrack ? currentTrack.name : 'Selecciona una pista'}
                    </h3>
                    <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </p>
                </div>
        </div>
    )
}