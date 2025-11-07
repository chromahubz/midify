import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { ConversionProgress as ConversionProgressType } from '../types/index';

interface ConversionProgressProps {
  progress: ConversionProgressType;
}

export const ConversionProgress = ({ progress }: ConversionProgressProps) => {
  const { stage, progress: percentage, message } = progress;

  if (stage === 'idle') return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4">
        {stage === 'loading' || stage === 'processing' ? (
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin flex-shrink-0" />
        ) : stage === 'complete' ? (
          <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
        )}

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 mb-2">{message}</p>
          {stage !== 'complete' && stage !== 'error' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {stage !== 'error' && (
          <span className="text-sm font-semibold text-gray-600 flex-shrink-0">
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
};
