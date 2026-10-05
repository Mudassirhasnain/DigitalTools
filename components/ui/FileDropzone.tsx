'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';

export interface FileDropzoneProps {
  accept?: string;
  maxSizeBytes?: number;
  onFileSelect: (file: File) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  accept,
  maxSizeBytes = 25 * 1024 * 1024, // 25MB default
  onFileSelect,
  label = 'Drag and drop your file here, or browse',
  helperText,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    setErrorMessage(null);
    if (maxSizeBytes && file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      setErrorMessage(`File exceeds the ${maxMb}MB size limit.`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload file dropzone"
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/30'
            : 'border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          tabIndex={-1}
        />
        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-xs mb-3 text-blue-600 dark:text-blue-400">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {helperText || `Supports ${accept ? accept : 'standard files'} up to ${Math.round(maxSizeBytes / (1024 * 1024))}MB`}
        </p>
      </div>
      {errorMessage && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
