# Audio to MIDI Converter

A high-quality web application that converts audio files to MIDI using Spotify's Basic Pitch AI model. Built with modern web technologies for accurate polyphonic audio-to-MIDI transcription.

## Features

- **Drag & Drop Interface** - Easy file upload with visual feedback
- **High-Quality Conversion** - Powered by Spotify's Basic Pitch neural network
- **Polyphonic Support** - Handles multiple simultaneous notes
- **Instrument Agnostic** - Works with piano, guitar, vocals, and more
- **Real-time Waveform** - Visual audio representation with playback controls
- **Piano Roll View** - Interactive MIDI note visualization
- **MIDI Playback** - Listen to converted MIDI with SoundFont synthesis
- **Pitch Bend Detection** - Captures subtle pitch variations
- **Download MIDI** - Export converted files for use in DAWs

## Tech Stack

### Core Framework
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **Tailwind CSS** for modern, responsive styling

### Audio Processing
- **@spotify/basic-pitch** - AI-powered audio-to-MIDI conversion (301 GitHub stars)
- **Web Audio API** - Browser-native audio processing
- **Tone.js** - Audio synthesis and MIDI handling
- **@tonejs/midi** - MIDI file creation and manipulation

### UI Components
- **react-dropzone** - Professional drag-and-drop file handling
- **lucide-react** - 1000+ clean SVG icons (no emojis)
- **wavesurfer.js** - High-quality waveform visualization
- **html-midi-player** - Piano roll visualization built on Magenta.js

## Installation

```bash
# Clone or navigate to the project directory
cd audio-to-midi

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Upload Audio** - Drag and drop an audio file or click to browse
   - Supported formats: MP3, WAV, OGG, FLAC, M4A

2. **Wait for Processing** - The AI model will analyze your audio
   - Audio is automatically resampled to 22050 Hz
   - Stereo files are converted to mono for optimal results

3. **View Results**
   - Waveform display with playback controls
   - Piano roll visualization showing detected notes
   - MIDI player with SoundFont synthesis

4. **Download MIDI** - Click the download button to save your MIDI file

## How It Works

1. **Audio Loading** - File is read and decoded using Web Audio API
2. **Preprocessing** - Audio is converted to mono and resampled to 22050 Hz
3. **AI Analysis** - Basic Pitch neural network detects pitches, onsets, and contours
4. **Note Extraction** - Raw predictions are converted to discrete note events
5. **Pitch Bends** - Subtle pitch variations are captured for expression
6. **MIDI Generation** - Notes are formatted and exported as a standard MIDI file

## Best Results

For optimal conversion quality:
- Use solo instruments or vocals (works best on one instrument at a time)
- Provide clean audio with minimal background noise
- Piano and guitar recordings typically yield excellent results
- Consider shorter audio clips for faster processing

## Model Details

**Basic Pitch** by Spotify
- Lightweight neural network (<20MB peak memory, <17K parameters)
- Published at ICASSP 2022
- Instrument-agnostic polyphonic note transcription
- 10x faster than real-time processing
- Apache 2.0 License

## Project Structure

```
src/
├── components/
│   ├── FileDropzone.tsx       # Drag-and-drop file upload
│   ├── WaveformDisplay.tsx    # Audio waveform visualization
│   ├── PianoRollViewer.tsx    # MIDI note visualization
│   ├── MidiPlayer.tsx         # MIDI playback and download
│   └── ConversionProgress.tsx # Progress indicator
├── hooks/
│   └── useAudioToMidi.ts      # Core conversion logic
├── types/
│   └── index.ts               # TypeScript definitions
└── App.tsx                    # Main application
```

## Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## Browser Compatibility

- Chrome/Edge 91+
- Firefox 90+
- Safari 14.1+
- Requires modern browser with Web Audio API support

## Credits

- **Spotify Research** - Basic Pitch AI model
- **Google Magenta** - MIDI visualization tools
- **Community** - Open-source libraries and contributors

## License

This project uses open-source software:
- Basic Pitch - Apache 2.0
- All other dependencies - See individual package licenses

Built with React, TypeScript, Tailwind CSS, and Spotify's Basic Pitch
