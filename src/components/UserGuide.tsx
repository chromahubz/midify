import { FileAudio, Music, Download, Sparkles } from 'lucide-react';

export const UserGuide = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md p-8 border border-blue-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How to Convert Audio to MIDI
        </h2>
        <p className="text-gray-600">
          Transform your music into MIDI files in just a few simple steps
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1 */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 mx-auto">
            <FileAudio className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">1. Upload Audio</h3>
            <p className="text-sm text-gray-600">
              Drag and drop or click to upload your audio file (MP3, WAV, etc.)
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">2. AI Processing</h3>
            <p className="text-sm text-gray-600">
              Our AI analyzes your audio and extracts musical notes automatically
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
            <Music className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">3. Preview & Play</h3>
            <p className="text-sm text-gray-600">
              Listen to the MIDI playback and view the piano roll visualization
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4 mx-auto">
            <Download className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 mb-2">4. Download MIDI</h3>
            <p className="text-sm text-gray-600">
              Download your converted MIDI file and use it in any music software
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-semibold text-gray-900">100% Free</p>
            <p className="text-xs text-gray-600">No signup or payment required</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">AI-Powered</p>
            <p className="text-xs text-gray-600">Advanced polyphonic detection</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Privacy First</p>
            <p className="text-xs text-gray-600">All processing happens in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
};
