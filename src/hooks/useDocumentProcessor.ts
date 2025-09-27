import { useState, useCallback } from 'react';
import { DocumentProto, ProcessingState, FileUploadState, ExtractedParagraph } from '../types';
import { validateJsonContent, isJsonFile, extractParagraphs } from '../utils';

export function useDocumentProcessor() {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    isComplete: false,
    error: null
  });

  const [fileState, setFileState] = useState<FileUploadState>({
    file: null,
    fileName: '',
    content: null
  });

  const [documentProto, setDocumentProto] = useState<DocumentProto | null>(null);
  const [paragraphs, setParagraphs] = useState<ExtractedParagraph[]>([]);

  const processFile = useCallback(async (file: File): Promise<void> => {
    setProcessingState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Validate file type
      if (!isJsonFile(file)) {
        throw new Error('Please select a valid JSON file');
      }

      // Read file content
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (!result) {
            reject(new Error('Failed to read file content'));
            return;
          }
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file, 'UTF-8');
      });

      // Validate JSON content
      const validation = validateJsonContent(content);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid JSON format');
      }

      // Parse and set document data
      const parsedDocument = JSON.parse(content) as DocumentProto;
      
      setFileState({
        file,
        fileName: file.name,
        content
      });
      
      setDocumentProto(parsedDocument);

      // Extract paragraphs
      const extractedParagraphs = extractParagraphs(parsedDocument);
      setParagraphs(extractedParagraphs);
      
      setProcessingState({
        isProcessing: false,
        isComplete: true,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProcessingState({
        isProcessing: false,
        isComplete: false,
        error: errorMessage
      });
    }
  }, []);

  const reset = useCallback(() => {
    setProcessingState({
      isProcessing: false,
      isComplete: false,
      error: null
    });
    setFileState({
      file: null,
      fileName: '',
      content: null
    });
    setDocumentProto(null);
    setParagraphs([]);
  }, []);

  return {
    processingState,
    fileState,
    document: documentProto,
    paragraphs,
    processFile,
    reset
  };
}