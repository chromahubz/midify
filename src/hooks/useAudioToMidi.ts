import { useState, useCallback } from 'react';
import { BasicPitch, addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly } from '@spotify/basic-pitch';
import { Midi } from '@tonejs/midi';
import type { ConversionProgress, MidiData, NoteEvent } from '../types/index';

const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch@1.0.1/model/model.json';
const TARGET_SAMPLE_RATE = 22050;

export const useAudioToMidi = () => {
  const [progress, setProgress] = useState<ConversionProgress>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [midiData, setMidiData] = useState<MidiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertAudioToMidi = useCallback(async (audioFile: File) => {
    let audioContext: AudioContext | null = null;

    try {
      console.log('🎵 Starting conversion for:', audioFile.name);
      setError(null);
      setProgress({
        stage: 'loading',
        progress: 10,
        message: 'Loading audio file...'
      });

      // Read audio file as ArrayBuffer
      console.log('📁 Reading file as ArrayBuffer...');
      const arrayBuffer = await audioFile.arrayBuffer();
      console.log('✅ File read successfully, size:', arrayBuffer.byteLength, 'bytes');

      setProgress({
        stage: 'loading',
        progress: 20,
        message: 'Decoding and processing audio...'
      });

      // Decode audio at native sample rate
      console.log('🎧 Creating AudioContext for decode...');
      audioContext = new AudioContext();
      console.log('✅ AudioContext created, sample rate:', audioContext.sampleRate);

      console.log('🔄 Decoding audio data...');
      const originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('✅ Audio decoded:', {
        duration: originalBuffer.duration,
        channels: originalBuffer.numberOfChannels,
        sampleRate: originalBuffer.sampleRate,
        length: originalBuffer.length
      });

      // Close the original context
      audioContext.close();

      setProgress({
        stage: 'loading',
        progress: 25,
        message: 'Converting to mono and resampling...'
      });

      // Use OfflineAudioContext to convert to mono AND resample in one efficient step
      console.log('🔄 Setting up offline processing (mono + resample to 22050 Hz)...');
      const outputLength = Math.ceil(originalBuffer.duration * TARGET_SAMPLE_RATE);
      const offlineContext = new OfflineAudioContext(1, outputLength, TARGET_SAMPLE_RATE);

      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = originalBuffer;

      // If stereo, create a channel merger to mix down to mono
      if (originalBuffer.numberOfChannels > 1) {
        console.log('🔀 Mixing stereo to mono...');
        const merger = offlineContext.createChannelMerger(1);

        // Create a gain node to average the channels
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = 1.0 / originalBuffer.numberOfChannels;

        source.connect(gainNode);
        gainNode.connect(merger);
        merger.connect(offlineContext.destination);
      } else {
        source.connect(offlineContext.destination);
      }

      source.start(0);

      console.log('⚙️ Processing audio (this may take a moment)...');
      const processedBuffer = await offlineContext.startRendering();

      console.log('✅ Audio processed:', {
        channels: processedBuffer.numberOfChannels,
        sampleRate: processedBuffer.sampleRate,
        duration: processedBuffer.duration,
        length: processedBuffer.length
      });

      setProgress({
        stage: 'loading',
        progress: 30,
        message: 'Loading AI model...'
      });

      // Initialize Basic Pitch with model
      console.log('🤖 Loading Basic Pitch model from:', MODEL_URL);
      const basicPitch = new BasicPitch(MODEL_URL);
      console.log('✅ Model loaded');

      setProgress({
        stage: 'processing',
        progress: 40,
        message: 'Running pitch detection...'
      });

      // Run Basic Pitch model
      console.log('🎯 Starting pitch detection...');
      const frames: number[][] = [];
      const onsets: number[][] = [];
      const contours: number[][] = [];

      await basicPitch.evaluateModel(
        processedBuffer,
        (f: number[][], o: number[][], c: number[][]) => {
          frames.push(...f);
          onsets.push(...o);
          contours.push(...c);
        },
        (progressPercent: number) => {
          console.log(`⏳ Processing: ${Math.floor(progressPercent * 100)}%`);
          setProgress({
            stage: 'processing',
            progress: 40 + Math.floor(progressPercent * 40),
            message: `Analyzing audio: ${Math.floor(progressPercent * 100)}%`
          });
        }
      );

      console.log('✅ Pitch detection complete:', {
        frames: frames.length,
        onsets: onsets.length,
        contours: contours.length
      });

      setProgress({
        stage: 'processing',
        progress: 85,
        message: 'Converting to MIDI notes...'
      });

      // Convert frames to note events
      console.log('🎼 Converting to MIDI notes...');
      const rawNotes = outputToNotesPoly(
        frames,
        onsets,
        0.25, // onset threshold
        0.25, // frame threshold
        5     // minimum note length in frames
      );
      console.log('✅ Raw notes extracted:', rawNotes.length);

      // Add pitch bends
      console.log('🎵 Adding pitch bends...');
      const notesWithBends = addPitchBendsToNoteEvents(contours, rawNotes);

      // Convert to time-based notes
      const noteEvents = noteFramesToTime(notesWithBends);
      console.log('✅ Note events created:', noteEvents.length);

      setProgress({
        stage: 'processing',
        progress: 90,
        message: 'Generating MIDI file...'
      });

      // Convert to MIDI using Tone.js Midi
      console.log('💾 Generating MIDI file...');
      const midi = new Midi();
      const track = midi.addTrack();

      const noteList: NoteEvent[] = [];

      noteEvents.forEach((note: any) => {
        track.addNote({
          midi: note.pitchMidi,
          time: note.startTimeSeconds,
          duration: note.durationSeconds,
          velocity: note.amplitude || 0.8,
        });

        noteList.push({
          startTime: note.startTimeSeconds,
          endTime: note.startTimeSeconds + note.durationSeconds,
          pitch: note.pitchMidi,
          velocity: note.amplitude || 0.8,
          pitchBend: note.pitchBends,
        });
      });

      // Convert to Blob
      const midiArray = midi.toArray();
      const midiBlob = new Blob([midiArray.buffer as ArrayBuffer], { type: 'audio/midi' });
      const midiUrl = URL.createObjectURL(midiBlob);
      console.log('✅ MIDI file created, size:', midiBlob.size, 'bytes');

      setMidiData({
        blob: midiBlob,
        url: midiUrl,
        notes: noteList,
      });

      setProgress({
        stage: 'complete',
        progress: 100,
        message: `Conversion complete! ${noteList.length} notes detected.`
      });

      console.log('🎉 Conversion complete!', noteList.length, 'notes detected');

    } catch (err) {
      console.error('❌ Conversion error:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');

      setError(err instanceof Error ? err.message : 'Conversion failed');
      setProgress({
        stage: 'error',
        progress: 0,
        message: 'Conversion failed'
      });

      // Cleanup on error
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (midiData?.url) {
      URL.revokeObjectURL(midiData.url);
    }
    setMidiData(null);
    setProgress({
      stage: 'idle',
      progress: 0,
      message: ''
    });
    setError(null);
  }, [midiData]);

  return {
    convertAudioToMidi,
    progress,
    midiData,
    error,
    reset,
  };
};
