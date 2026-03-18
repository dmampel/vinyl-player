import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Music, X, Shuffle, Repeat, LayoutGrid, Disc, ListMusic, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  // Widget visibility state
  const [widgets, setWidgets] = useState({
    vinyl: false,
    trackInfo: false,
    controls: false,
    upload: true,
    playlist: false
  });
  
  const audioRef = useRef(null);
  const constraintsRef = useRef(null);
  
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newTracks = files.filter(f => f.type.startsWith('audio/')).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, "")
    }));
    
    setPlaylist(prev => [...prev, ...newTracks]);
    
    if (currentIndex === -1 && newTracks.length > 0) {
      setCurrentIndex(0);
    }
  };

  const handleRemoveTrack = (e, index) => {
    e.stopPropagation();
    const newPlaylist = [...playlist];
    URL.revokeObjectURL(newPlaylist[index].url);
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);
    
    if (newPlaylist.length === 0) {
      setCurrentIndex(-1);
      setIsPlaying(false);
    } else if (index === currentIndex) {
      const nextIdx = index >= newPlaylist.length ? newPlaylist.length - 1 : index;
      setCurrentIndex(nextIdx);
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClearPlaylist = () => {
    playlist.forEach(t => URL.revokeObjectURL(t.url));
    setPlaylist([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (playlist.length === 0) return;
    if (currentIndex === -1) {
      setCurrentIndex(0);
      return;
    }
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (playlist.length === 0) return;
    let nextIdx = currentIndex + 1;
    if (nextIdx >= playlist.length) nextIdx = 0;
    setCurrentIndex(nextIdx);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) prevIdx = playlist.length - 1;
    setCurrentIndex(prevIdx);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const handleSeek = (e) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      const newTime = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  const handleVolumeChange = (e) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    } else if (!currentTrack && audioRef.current) {
      audioRef.current.src = "";
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentIndex, currentTrack]);

  useEffect(() => {
    if (isPlaying && currentIndex === 0 && playlist.length > 0 && audioRef.current?.paused) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentIndex, isPlaying, playlist]);

  // Handle responsive desktop toggle
  const [isDesktop, setIsDesktop] = useState(true);
  const [uploadExpanded, setUploadExpanded] = useState(true);
  
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleWidget = (key) => setWidgets(prev => ({...prev, [key]: !prev[key]}));

  return (
    <div className={`w-full bg-[#fafafa] font-sans text-gray-800 ${isDesktop ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto pb-12'}`}>
      
      {/* Absolute Header (non-draggable) */}
      <div className={`text-center z-0 ${isDesktop ? 'absolute top-8 left-0 right-0 pointer-events-none' : 'mt-8 mb-6'}`}>
        <h1 className="text-[28px] md:text-[32px] font-bold text-[#111] mb-1 tracking-tight">Really Cool Vinyl</h1>
        <p className="text-[#888] font-medium text-[13px] md:text-[15px]">{isDesktop ? 'Widget Canvas' : 'Music Player'}</p>
      </div>

      <main ref={constraintsRef} className={`${isDesktop ? 'absolute inset-0 z-10 p-6 pt-32 h-full w-full pointer-events-auto' : 'flex flex-col items-center gap-6 px-4 w-full max-w-[400px] mx-auto z-10 relative'}`}>
        
        <AnimatePresence>
          {(isDesktop ? widgets.vinyl : true) && (
            <motion.div 
              key="vinyl"
              drag={isDesktop}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              whileDrag={isDesktop ? { scale: 1.02, cursor: "grabbing" } : {}}
              initial={isDesktop ? { opacity: 0, scale: 0.9, x: 100, y: 20 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={isDesktop ? "absolute cursor-grab active:cursor-grabbing" : "w-full flex justify-center"}
              style={isDesktop ? { zIndex: 10 } : {}}
            >
              {/* Vinyl Card Widget */}
              <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] p-6 md:p-8 relative flex items-center justify-center aspect-square w-full sm:w-[320px] md:w-[380px]">
                <span className="absolute bottom-6 left-8 text-[10px] tracking-[0.2em] text-gray-300 font-bold uppercase pointer-events-none">Vintage</span>
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
            </motion.div>
          )}

          {(isDesktop ? widgets.trackInfo : true) && (
            <motion.div 
              key="trackInfo"
              drag={isDesktop}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              whileDrag={isDesktop ? { scale: 1.02, cursor: "grabbing" } : {}}
              initial={isDesktop ? { opacity: 0, scale: 0.9, x: 550, y: 100 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              className={isDesktop ? "absolute cursor-grab active:cursor-grabbing" : "w-full flex justify-center"}
              style={isDesktop ? { zIndex: 11 } : {}}
            >
              {/* Track Info Card */}
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
            </motion.div>
          )}

          {(isDesktop ? widgets.controls : true) && (
            <motion.div 
              key="controls"
              drag={isDesktop}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              whileDrag={isDesktop ? { scale: 1.02, cursor: "grabbing" } : {}}
              initial={isDesktop ? { opacity: 0, scale: 0.9, x: 500, y: 200 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              className={isDesktop ? "absolute cursor-grab active:cursor-grabbing" : "w-full flex justify-center"}
              style={isDesktop ? { zIndex: 12 } : {}}
            >
              {/* Controls Card */}
              <div className="bg-white rounded-[1.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100/50 p-6 px-8 w-full sm:w-[320px] md:w-[380px]">
                {/* Progress */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-[11px] font-bold text-gray-400 w-10 text-left pointer-events-none">{formatTime(currentTime)}</span>
                  <div className="relative flex-1 h-1 bg-gray-100 rounded-full cursor-pointer pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                    <div className="absolute top-0 left-0 h-full bg-[#111] rounded-full pointer-events-none" style={{width: `${progress || 0}%`}} />
                    <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-[#111] rounded-full shadow pointer-events-none" style={{left: `calc(${(progress || 0)}% - 4px)`}} />
                    <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 w-10 text-right pointer-events-none">{formatTime(duration)}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between mb-6 px-2 pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                  <button className="text-gray-400 hover:text-gray-800 transition-colors"><Shuffle className="w-4 h-4" /></button>
                  <div className="flex items-center gap-6">
                    <button onClick={playPrev} className="text-gray-600 hover:text-black transition-colors disabled:opacity-30" disabled={playlist.length === 0}><SkipBack className="w-5 h-5 fill-current" /></button>
                    <button onClick={togglePlay} className="w-14 h-14 bg-[#111] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(0,0,0,0.2)] disabled:opacity-50" disabled={playlist.length === 0}>
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                    </button>
                    <button onClick={playNext} className="text-gray-600 hover:text-black transition-colors disabled:opacity-30" disabled={playlist.length === 0}><SkipForward className="w-5 h-5 fill-current" /></button>
                  </div>
                  <button className="text-gray-400 hover:text-gray-800 transition-colors"><Repeat className="w-4 h-4" /></button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-4 w-[60%] mx-auto justify-center pointer-events-auto" onPointerDownCapture={(e) => e.stopPropagation()}>
                  <Volume2 className="w-4 h-4 text-gray-400 shrink-0 pointer-events-none" />
                  <div className="relative flex-1 h-1 bg-gray-100 rounded-full cursor-pointer">
                    <div className="absolute top-0 left-0 h-full bg-[#111] rounded-full pointer-events-none" style={{width: `${volume * 100}%`}} />
                    <div className="absolute top-1/2 -mt-1 w-2 h-2 bg-[#111] rounded-full shadow pointer-events-none" style={{left: `calc(${volume * 100}% - 4px)`}} />
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Permanent Upload Widget (Fixed) */}
          <motion.div 
            key="upload"
            initial={isDesktop ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
            className={isDesktop ? "absolute top-6 left-6" : "w-full flex justify-center"}
            style={isDesktop ? { zIndex: 40 } : {}}
          >
            <motion.div 
              animate={{ 
                width: (!isDesktop || uploadExpanded) ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? 320 : 380) : 56, 
                height: (!isDesktop || uploadExpanded) ? 220 : 56,
                borderRadius: (!isDesktop || uploadExpanded) ? 32 : 50,
                backgroundColor: (!isDesktop || uploadExpanded) ? '#fafafa' : '#111'
              }}
              transition={{type: "spring", stiffness: 300, damping: 25}}
              onMouseLeave={() => isDesktop && setUploadExpanded(false)}
              className={`border-[1.5px] border-gray-300 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] ${uploadExpanded ? 'border-dashed hover:bg-white' : 'border-solid border-transparent shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:scale-110'}`}
              style={{ padding: uploadExpanded ? '2rem' : '0' }}
            >
              
              <AnimatePresence mode="wait">
                {(!isDesktop || uploadExpanded) ? (
                  <motion.div 
                    key="expanded"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center text-center w-full h-full"
                  >
                    <button 
                      onClick={() => isDesktop && setUploadExpanded(false)} 
                      className={`absolute top-4 right-4 text-gray-400 hover:text-gray-800 p-2 pointer-events-auto transition-colors z-20 bg-white/50 rounded-full hover:bg-gray-100 ${!isDesktop && 'hidden'}`}
                      title="Minimizar a botón +"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="pointer-events-auto w-full flex flex-col items-center" onPointerDownCapture={(e) => e.stopPropagation()}>
                      <label className="cursor-pointer flex flex-col items-center w-full">
                        <div className="w-[3rem] h-[3rem] rounded-full bg-[#111] flex items-center justify-center mb-6 shadow-xl relative ring-[10px] ring-gray-100/50 hover:scale-105 transition-transform">
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                        <h3 className="text-[15px] font-bold text-gray-800 mb-1.5 hover:text-[#111]">Arrastra archivos</h3>
                        <p className="text-[13px] text-gray-400 mb-4 font-medium">o haz clic aquí</p>
                        <input type="file" className="hidden" multiple accept="audio/*" onChange={handleUpload} />
                      </label>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="compact"
                    initial={{ opacity: 0, scale: 0.5 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setUploadExpanded(true)}
                    onMouseEnter={() => setUploadExpanded(true)}
                    className="w-full h-full flex items-center justify-center text-white cursor-pointer pointer-events-auto"
                    title="Expandir área de subida"
                  >
                    <Upload className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              
            </motion.div>
          </motion.div>

          {(isDesktop ? widgets.playlist : true) && (
            <motion.div 
              key="playlist"
              drag={isDesktop}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              whileDrag={isDesktop ? { scale: 1.02, cursor: "grabbing" } : {}}
              initial={isDesktop ? { opacity: 0, scale: 0.9, x: 900, y: -80 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              className={isDesktop ? "absolute cursor-grab active:cursor-grabbing" : "w-full flex justify-center"}
              style={isDesktop ? { zIndex: 14 } : {}}
            >
              {/* Playlist Card */}
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
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Toolbar / Widget Menu - Desktop Only */}
      {isDesktop && (
        <div className=" absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-2xl flex items-center gap-2 p-2 z-50">
          <button onClick={() => toggleWidget('vinyl')} className={`p-3 rounded-xl transition-all ${widgets.vinyl ? 'text-[#111] cursor-pointer hover:scale-150 transition-all' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all'}`} title="Vinyl Disc"><Disc className="w-6 h-6" /></button>
          <button onClick={() => toggleWidget('trackInfo')} className={`p-3 rounded-xl transition-all ${widgets.trackInfo ? 'text-[#111] cursor-pointer hover:scale-150 transition-all' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all'}`} title="Track Info"><Music className="w-6 h-6" /></button>
          <button onClick={() => toggleWidget('controls')} className={`p-3 rounded-xl transition-all ${widgets.controls ? 'text-[#111] cursor-pointer hover:scale-150 transition-all' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all'}`} title="Controls"><Sliders className="w-6 h-6" /></button>
          <button onClick={() => toggleWidget('playlist')} className={`p-3 rounded-xl transition-all ${widgets.playlist ? 'text-[#111] cursor-pointer hover:scale-150 transition-all' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer hover:scale-150 transition-all'}`} title="Playlist"><ListMusic className="w-6 h-6" /></button>
        </div>
      )}

      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} className="hidden" />
    </div>
  );
}
