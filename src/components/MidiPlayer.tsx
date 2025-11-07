import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, Volume2, VolumeX, Repeat, Repeat1 } from 'lucide-react';

interface MidiPlayerProps {
  midiUrl: string;
  fileName?: string;
  onPlayerReady?: (player: any) => void;
}

export const MidiPlayer = ({ midiUrl, fileName = 'MIDI', onPlayerReady }: MidiPlayerProps) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    if (!playerContainerRef.current) return;

    // Dynamically import html-midi-player
    import('html-midi-player').then(() => {
      if (!playerContainerRef.current) return;

      // Clear previous content
      playerContainerRef.current.innerHTML = '';

      // Create MIDI player element
      const player = document.createElement('midi-player') as any;
      player.setAttribute('src', midiUrl);
      player.setAttribute('sound-font', 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
      player.style.display = 'none'; // Hide default player UI

      // Event listeners
      player.addEventListener('start', () => {
        console.log('🎵 Playback started');
        setIsPlaying(true);
      });

      player.addEventListener('stop', () => {
        console.log('⏹️ Playback stopped');
        setIsPlaying(false);

        // Handle looping - restart if loop is enabled
        if (isLooping && player.currentTime >= player.duration - 0.1) {
          console.log('🔁 Looping - restarting playback');
          setTimeout(() => {
            player.currentTime = 0;
            player.start();
          }, 100);
        }
      });

      player.addEventListener('note', (e: any) => {
        console.log('🎹 Note:', e.detail);
      });

      // Track current time - throttled updates to prevent glitchiness
      let lastUpdateTime = 0;
      let animationFrameId: number;

      const updateTime = (timestamp: number) => {
        // Throttle to ~10 updates per second
        if (timestamp - lastUpdateTime >= 100) {
          if (player && player.currentTime !== undefined && !isSeeking) {
            setCurrentTime(player.currentTime);
            if (player.duration) {
              setDuration(player.duration);
            }
          }
          lastUpdateTime = timestamp;
        }
        animationFrameId = requestAnimationFrame(updateTime);
      };

      animationFrameId = requestAnimationFrame(updateTime);

      playerContainerRef.current.appendChild(player);
      playerRef.current = player;

      // Wait for player to load MIDI file before calling onPlayerReady
      player.addEventListener('load', () => {
        console.log('🎮 Player loaded and ready');
        if (onPlayerReady) {
          onPlayerReady(player);
        }
      });

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }).catch((err) => {
      console.error('Failed to load MIDI player:', err);
    });
  }, [midiUrl, onPlayerReady, isSeeking, isLooping]);

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.stop();
    } else {
      playerRef.current.start();
    }
  };

  const handleRestart = () => {
    if (!playerRef.current) return;
    playerRef.current.currentTime = 0;
    if (!isPlaying) {
      playerRef.current.start();
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    console.log('🔁 Loop toggled:', !isLooping);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Hidden player element */}
      <div ref={playerContainerRef} style={{ display: 'none' }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-md">
            {isPlaying ? (
              <div className="relative">
                <div className="absolute inset-0 bg-green-300 rounded-lg animate-ping opacity-50"></div>
                <Play className="w-6 h-6 text-white relative" fill="white" />
              </div>
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">MIDI Playback</h3>
            <p className="text-xs text-gray-500">{fileName}</p>
          </div>
        </div>

        {/* Status Badge */}
        {isPlaying && (
          <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Playing
          </span>
        )}
      </div>

      {/* Progress Bar - Fixed glitchiness */}
      <div className="mb-6">
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          {/* Progress fill - no transition to prevent glitchiness */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${progressPercent}%`, transition: 'none' }}
          />
          {/* Invisible slider overlay */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.01"
            value={currentTime}
            onMouseDown={handleSeekStart}
            onChange={(e) => {
              if (!playerRef.current) return;
              const newTime = parseFloat(e.target.value);
              setCurrentTime(newTime);
              playerRef.current.currentTime = newTime;
            }}
            onMouseUp={handleSeekEnd}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all transform hover:scale-105"
          title="Restart"
        >
          <SkipBack className="w-5 h-5 text-gray-700" />
        </button>

        {/* Loop Button */}
        <button
          onClick={toggleLoop}
          className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
            isLooping
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isLooping ? 'Loop enabled - Click to disable' : 'Loop disabled - Click to enable'}
        >
          <Repeat className="w-5 h-5" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="p-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg transition-all transform hover:scale-110"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-7 h-7" fill="white" />
          ) : (
            <Play className="w-7 h-7 ml-0.5" fill="white" />
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <button
            onClick={toggleMute}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          🎼 High-quality SoundFont synthesis • 🎹 Notes sync with visualization below
          {isLooping && ' • 🔁 Loop enabled'}
        </p>
      </div>
    </div>
  );
};
