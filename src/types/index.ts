export interface AudioFile {
  file: File;
  url: string;
  duration: number;
}

export interface MidiData {
  blob: Blob;
  url: string;
  notes: NoteEvent[];
}

export interface NoteEvent {
  startTime: number;
  endTime: number;
  pitch: number;
  velocity: number;
  pitchBend?: number[];
}

export interface ConversionProgress {
  stage: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
}
