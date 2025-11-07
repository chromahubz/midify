import { useEffect, useRef, useState } from 'react';
import { Music, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface PianoRollViewerProps {
  midiUrl: string;
  noteCount?: number;
  playerRef?: React.MutableRefObject<any>;
}

export const PianoRollViewer = ({ midiUrl, noteCount, playerRef }: PianoRollViewerProps) => {
  const visualizerRef = useRef<HTMLDivElement>(null);
  const localVisualizerRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visualizerType, setVisualizerType] = useState<'piano-roll' | 'waterfall'>('waterfall');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (!visualizerRef.current) return;

    // Dynamically import html-midi-player
    import('html-midi-player').then(() => {
      if (!visualizerRef.current) return;

      // Clear previous content
      visualizerRef.current.innerHTML = '';

      // Create MIDI visualizer element
      const visualizer = document.createElement('midi-visualizer') as any;
      visualizer.setAttribute('src', midiUrl);
      visualizer.setAttribute('type', visualizerType);
      visualizer.style.width = '100%';
      visualizer.style.height = isFullscreen ? '550px' : '400px';
      visualizer.style.transform = `scale(${zoomLevel})`;
      visualizer.style.transformOrigin = 'left top';

      // High contrast dark background
      visualizer.style.background = '#0a0e27';
      visualizer.style.borderRadius = '8px';

      // Add custom CSS for better note visibility
      visualizer.style.setProperty('--color-note', '#00d9ff');  // Bright cyan for notes
      visualizer.style.setProperty('--color-note-active', '#00ff88');  // Bright green for active notes
      visualizer.style.setProperty('--color-background', '#0a0e27');  // Very dark blue
      visualizer.style.setProperty('--color-gridline', '#1a2847');  // Subtle grid lines

      visualizerRef.current.appendChild(visualizer);
      localVisualizerRef.current = visualizer;

      // Link visualizer to player when both are ready
      let retryCount = 0;
      const maxRetries = 50; // Max 5 seconds (50 * 100ms)
      let timeoutId: NodeJS.Timeout | null = null;

      const linkVisualizer = () => {
        if (playerRef?.current) {
          console.log('🔗 Linking visualizer to player for live sync');
          try {
            playerRef.current.addVisualizer(visualizer);
            console.log('✅ Visualizer linked successfully');
          } catch (err) {
            console.warn('Failed to link visualizer:', err);
          }
        } else if (retryCount < maxRetries) {
          // Player not ready yet, retry after a short delay
          retryCount++;
          console.log(`⏳ Player not ready, retrying (${retryCount}/${maxRetries})...`);
          timeoutId = setTimeout(linkVisualizer, 100);
        } else {
          console.warn('❌ Max retries reached, player not available');
        }
      };

      // Start linking process (will retry if player not ready)
      linkVisualizer();

      // Cleanup function
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }).catch((err) => {
      console.error('Failed to load MIDI visualizer:', err);
    });
  }, [midiUrl, visualizerType, isFullscreen, zoomLevel, playerRef]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5)); // Min 0.5x zoom
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setScrollPosition(0);
    if (visualizerRef.current) {
      visualizerRef.current.scrollLeft = 0;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Music className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {visualizerType === 'waterfall' ? 'Waterfall' : 'Piano Roll'} MIDI Visualization
            </h3>
            <p className="text-xs text-gray-500">
              {visualizerType === 'waterfall'
                ? 'Animated cascading notes in real-time'
                : 'Notes displayed on horizontal timeline'}
            </p>
          </div>
          {noteCount !== undefined && (
            <span className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-sm">
              {noteCount} notes
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-gray-700" />
            </button>
            <span className="px-2 text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-white rounded transition-colors ml-1"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isFullscreen ? 'Minimize' : 'Maximize'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setVisualizerType('piano-roll')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            visualizerType === 'piano-roll'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎹 Piano Roll
        </button>
        <button
          onClick={() => setVisualizerType('waterfall')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            visualizerType === 'waterfall'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💧 Waterfall
        </button>
      </div>

      {/* Visualizer Container with Zoom Support */}
      <div
        className="border-2 border-gray-300 rounded-xl shadow-inner relative"
        style={{
          height: isFullscreen ? '550px' : '400px',
          transition: 'height 0.3s ease',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          overflow: 'auto',
          cursor: zoomLevel > 1 ? 'grab' : 'default'
        }}
      >
        <div
          ref={visualizerRef}
          style={{
            width: `${100 * zoomLevel}%`,
            height: `${(isFullscreen ? 550 : 400) * zoomLevel}px`,
            minWidth: '100%',
            minHeight: isFullscreen ? '550px' : '400px'
          }}
        />
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <div className="w-3 h-3 bg-blue-400 rounded-sm shadow-sm"></div>
              Active Notes
            </span>
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <div className="w-3 h-3 bg-green-400 rounded-sm shadow-sm animate-pulse"></div>
              Playing Now
            </span>
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <div className="w-3 h-3 bg-purple-400 rounded-sm shadow-sm"></div>
              Pitch Bends
            </span>
          </div>
          <span className="text-gray-600 font-medium">
            {visualizerType === 'piano-roll' && '⏱️ Horizontal: time • Vertical: pitch'}
            {visualizerType === 'waterfall' && '💫 Animated real-time cascade • Notes flow from top to bottom'}
            {zoomLevel > 1 && ' • 🔍 Zoomed ' + Math.round(zoomLevel * 100) + '% - Scroll horizontally & vertically'}
          </span>
        </div>
      </div>
    </div>
  );
};
