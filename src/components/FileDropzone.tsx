import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileDropzone = ({ onFileSelect, disabled = false }: FileDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a']
    },
    multiple: false,
    disabled
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400 bg-white' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <FileAudio className="w-16 h-16 text-blue-500" />
        ) : (
          <Upload className="w-16 h-16 text-gray-400" />
        )}

        <div>
          <p className="text-lg font-semibold text-gray-700">
            {isDragActive
              ? 'Drop your audio file here'
              : 'Drag & drop audio file here'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Supports MP3, WAV, OGG, FLAC, M4A
          </p>
        </div>

        {isDragReject && (
          <p className="text-sm text-red-500 font-medium">
            Please upload a valid audio file
          </p>
        )}
      </div>
    </div>
  );
};
