import { useState, useRef } from 'react';
import { FileDropzone } from './components/FileDropzone';
import { WaveformDisplay } from './components/WaveformDisplay';
import { PianoRollViewer } from './components/PianoRollViewer';
import { MidiPlayer } from './components/MidiPlayer';
import { ConversionProgress } from './components/ConversionProgress';
import { useAudioToMidi } from './hooks/useAudioToMidi';
import { Music2, RotateCcw, AlertCircle, Download } from 'lucide-react';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { convertAudioToMidi, progress, midiData, error, reset } = useAudioToMidi();
  const playerRef = useRef<any>(null);

  const handleFileSelect = async (file: File) => {
    // Cleanup previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset previous conversion
    reset();

    // Set new audio file
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    // Start conversion
    await convertAudioToMidi(file);
  };

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Midify - Audio to MIDI
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Transform any audio into MIDI with AI-powered precision
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* File Upload */}
          {!audioFile && (
            <FileDropzone
              onFileSelect={handleFileSelect}
              disabled={progress.stage === 'loading' || progress.stage === 'processing'}
            />
          )}

          {/* Conversion Progress */}
          {progress.stage !== 'idle' && <ConversionProgress progress={progress} />}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">Conversion Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Audio Waveform */}
          {audioUrl && audioFile && (
            <WaveformDisplay audioUrl={audioUrl} title={audioFile.name} />
          )}

          {/* MIDI Results with Live Interactive Playback */}
          {midiData && progress.stage === 'complete' && (
            <>
              {/* MIDI Player - Separate from visualization */}
              <MidiPlayer
                midiUrl={midiData.url}
                fileName={audioFile?.name || 'Audio'}
                onPlayerReady={(player) => {
                  playerRef.current = player;
                  console.log('🎮 Player ready for visualization sync');
                }}
              />

              {/* Piano Roll Visualization - Synced with player */}
              <PianoRollViewer
                midiUrl={midiData.url}
                noteCount={midiData.notes.length}
                playerRef={playerRef}
              />

              {/* Download Button */}
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Download MIDI File</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {audioFile?.name.replace(/\.[^/.]+$/, '.mid') || 'converted.mid'} • {(midiData.blob.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = midiData.url;
                    link.download = audioFile?.name.replace(/\.[^/.]+$/, '.mid') || 'converted.mid';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </>
          )}

          {/* Reset Button */}
          {audioFile && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                Convert Another File
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-600">
            © 2025 Midify. Free online audio to MIDI converter.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
