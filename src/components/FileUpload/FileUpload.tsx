'use client';

import { useRef, type ChangeEvent } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFileSelect, isProcessing }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploadContainer}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className={styles.hiddenInput}
      />
      <button 
        onClick={handleUploadClick}
        disabled={isProcessing}
        className={styles.uploadButton}
      >
        {isProcessing ? 'Processing...' : 'Upload Document'}
      </button>
    </div>
  );
}