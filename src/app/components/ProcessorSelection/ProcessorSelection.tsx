'use client';

import { useState, useEffect } from 'react';
import styles from './ProcessorSelection.module.css';
// Material UI imports removed - no longer needed for processor selection

interface CustomFile extends Blob {
  content: string;
  name: string;
  type: string;
  size: number;
}

interface ProcessorSelectionProps {
  onProcessorChange: (processor: string) => void;
  onFileChange: (file: CustomFile | null) => void;
  onFileNameChange: (fileName: string) => void;
  onShowBoundingChange: (showBounding: boolean) => void;
  onShowErrorChange: (showError: boolean) => void;
  onErrorMessageChange: (message: string) => void;
  onProcessIsDoneChange: (isDone: boolean) => void;
  onDocumentProtoChange: (proto: any) => void;
}

const ProcessorSelection: React.FC<ProcessorSelectionProps> = ({
  onProcessorChange,
  onFileChange,
  onFileNameChange,
  onShowErrorChange,
  onErrorMessageChange,
  onProcessIsDoneChange,
  onDocumentProtoChange
}) => {
  const processDocument = (jsonContent: string, fileName: string) => {
    if (!fileName || !jsonContent) {
      onShowErrorChange(true);
      onErrorMessageChange('ERROR : JSON file was not selected or is empty');
      return;
    }
    
    // Validate and parse JSON content
    try {
      const documentProto = JSON.parse(jsonContent);
      
      // Send the parsed JSON data back to the page
      onDocumentProtoChange(documentProto);
      onProcessIsDoneChange(true);
      onShowErrorChange(false); // Clear any previous errors
      
      // Set processor to OCR
      
      console.log('JSON data processed and sent to page:', documentProto);
    } catch (error) {
      onShowErrorChange(true);
      onErrorMessageChange('ERROR : Invalid JSON file format');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onShowErrorChange(true);
      onErrorMessageChange('No file selected');
      return;
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      onShowErrorChange(true);
      onErrorMessageChange('Please select a valid JSON file');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (!result) {
          onShowErrorChange(true);
          onErrorMessageChange('Failed to read file content');
          return;
        }

        const jsonContent = result as string;
        
        if (!jsonContent.trim()) {
          onShowErrorChange(true);
          onErrorMessageChange('JSON file is empty');
          return;
        }

        // Create a custom file object that extends Blob functionality
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const customFile: CustomFile = {
          ...blob,
          content: jsonContent,
          name: file.name,
          type: 'application/json',
          size: file.size,
          // Copy Blob methods
          arrayBuffer: blob.arrayBuffer.bind(blob),
          slice: blob.slice.bind(blob),
          stream: blob.stream.bind(blob),
          text: blob.text.bind(blob)
        };

        console.log("JSON content read successfully:", file.name);
        
        onFileChange(customFile);
        onFileNameChange(file.name);
        processDocument(jsonContent, file.name);
      } catch (error) {
        console.error('Error processing file:', error);
        onShowErrorChange(true);
        onErrorMessageChange(`Error reading JSON file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      onShowErrorChange(true);
      onErrorMessageChange('Failed to read the selected file');
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploadSection}>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          id="file-upload"
          className={styles.fileInput}
        />
        <label htmlFor="file-upload" className={styles.uploadButton}>
          Upload JSON File
        </label>
      </div>
    </div>
  );
};

export default ProcessorSelection;