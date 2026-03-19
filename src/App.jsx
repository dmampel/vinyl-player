import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, Music, X, Shuffle, Repeat, LayoutGrid, Disc, ListMusic, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VinylCard from './components/VinylCard';
import TrackInfoCard from './components/TrackInfoCard';
import ControlsCard from './components/ControlsCard';
import PlaylistCard from './components/PlaylistCard';
import WidgetButton from './components/WidgetButton';
import UploadWidget from './components/UploadWidget';
import { getAllTracks, saveTrack, deleteTrack, clearAllTracks } from './utils/db';

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
  const [showAutoplayOverlay, setShowAutoplayOverlay] = useState(false);

  const audioRef = useRef(null);
  const constraintsRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTrack = currentIndex >= 0 ? playlist[currentIndex] : null;

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const audioFiles = files.filter(f => f.type.startsWith('audio/'));
    
    const newTracks = [];
    for (const file of audioFiles) {
      const name = file.name.replace(/\.[^/.]+$/, "");
      try {
        const id = await saveTrack(file, name);
        newTracks.push({
          id,
          file,
          url: URL.createObjectURL(file),
          name
        });
      } catch (error) {
        console.error("Error saving track to DB:", error);
      }
    }

    setPlaylist(prev => [...prev, ...newTracks]);

    if (currentIndex === -1 && newTracks.length > 0) {
      setCurrentIndex(0);
    }
  };

  const handleRemoveTrack = async (e, index) => {
    e.stopPropagation();
    const trackToRemove = playlist[index];
    
    try {
      if (trackToRemove.id) {
        await deleteTrack(trackToRemove.id);
      }
      
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
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  const handleClearPlaylist = async () => {
    try {
      await clearAllTracks();
      playlist.forEach(t => URL.revokeObjectURL(t.url));
      setPlaylist([]);
      setCurrentIndex(-1);
      setIsPlaying(false);
    } catch (error) {
      console.error("Error clearing playlist:", error);
    }
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

  // Load tracks from DB on mount
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const savedTracks = await getAllTracks();
        if (savedTracks.length > 0) {
          const formattedTracks = savedTracks.map(track => ({
            ...track,
            url: URL.createObjectURL(track.file)
          }));
          setPlaylist(formattedTracks);
          setCurrentIndex(0);
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error loading tracks from DB:", error);
      }
    };
    loadTracks();
  }, []);

  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Autoplay failed:", error);
          setIsPlaying(false);
          setShowAutoplayOverlay(true);
        });
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

  const toggleWidget = (key) => setWidgets(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className={`w-full font-sans text-gray-800 relative ${isDesktop ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto pb-12'}`}
      style={{
        backgroundImage: `url(${isDesktop ? '/bg2.png' : '/bg-movile.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

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
              <VinylCard isPlaying={isPlaying} currentTrack={currentTrack} />
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
              <TrackInfoCard currentTrack={currentTrack} currentTime={currentTime} duration={duration} formatTime={formatTime} />
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
              <ControlsCard currentTrack={currentTrack} currentTime={currentTime} duration={duration} formatTime={formatTime} progress={progress} handleSeek={handleSeek} handleVolumeChange={handleVolumeChange} volume={volume} playPrev={playPrev} togglePlay={togglePlay} playNext={playNext} isPlaying={isPlaying} playlist={playlist} />
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
            <UploadWidget isDesktop={isDesktop} uploadExpanded={uploadExpanded} setUploadExpanded={setUploadExpanded} handleUpload={handleUpload} />
          </motion.div>

          {(isDesktop ? widgets.playlist : true) && (
            <motion.div
              key="playlist"
              drag={isDesktop}
              dragConstraints={constraintsRef}
              dragMomentum={false}
              whileDrag={isDesktop ? { scale: 1.02, cursor: "grabbing" } : {}}
              initial={isDesktop ? { opacity: 0, scale: 0.9, x: 900, y: 20 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              animate={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              className={isDesktop ? "absolute cursor-grab active:cursor-grabbing" : "w-full flex justify-center"}
              style={isDesktop ? { zIndex: 14 } : {}}
            >
              {/* Playlist Card */}
              <PlaylistCard
                playlist={playlist}
                currentIndex={currentIndex}
                handleClearPlaylist={handleClearPlaylist}
                setCurrentIndex={setCurrentIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                handleRemoveTrack={handleRemoveTrack}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Toolbar / Widget Menu - Desktop Only */}
      {isDesktop && (
        <div className=" absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] rounded-2xl flex items-center gap-2 p-2 z-50 bg-gradient-to-t from-white/10 to-transparent">
          <WidgetButton toggleWidget={toggleWidget} widgets={widgets} widgetType="vinyl" title="Vinyl Disc" icon={<Disc className="w-6 h-6" />} />
          <WidgetButton toggleWidget={toggleWidget} widgets={widgets} widgetType="trackInfo" title="Track Info" icon={<Music className="w-6 h-6" />} />
          <WidgetButton toggleWidget={toggleWidget} widgets={widgets} widgetType="controls" title="Controls" icon={<Sliders className="w-6 h-6" />} />
          <WidgetButton toggleWidget={toggleWidget} widgets={widgets} widgetType="playlist" title="Playlist" icon={<ListMusic className="w-6 h-6" />} />
        </div>
      )}

      {/* Autoplay Overlay */}
      <AnimatePresence>
        {showAutoplayOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAutoplayOverlay(false);
              setIsPlaying(true);
            }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer group"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
              <h2 className="text-white text-2xl font-bold tracking-tight mb-2">Toca para empezar</h2>
              <p className="text-white/60 font-medium">Pulsa en cualquier parte para activar la música</p>
              
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-12 text-white/30"
              >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                  <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onEnded={handleEnded} className="hidden" />
    </div>
  );
}
