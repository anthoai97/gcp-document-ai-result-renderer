// Core types for Document AI processing
export interface DocumentProto {
  text?: string;
  pages?: Page[];
  entities?: Entity[];
}

export interface Page {
  pageNumber?: number;
  image?: {
    content: string;
    mimeType?: string;
  };
  blocks?: Block[];
  paragraphs?: Paragraph[];
  tokens?: Token[];
  lines?: Line[];
}

export interface Block {
  layout?: Layout;
  detectedLanguages?: DetectedLanguage[];
}

export interface Paragraph {
  layout?: Layout;
  detectedLanguages?: DetectedLanguage[];
}

export interface Token {
  layout?: Layout;
  detectedBreak?: DetectedBreak;
}

export interface Line {
  layout?: Layout;
}

export interface Layout {
  textAnchor?: TextAnchor;
  confidence?: number;
  boundingPoly?: BoundingPoly;
  orientation?: string;
}

export interface TextAnchor {
  textSegments?: TextSegment[];
  content?: string;
}

export interface TextSegment {
  startIndex?: number;
  endIndex?: number;
}

export interface BoundingPoly {
  vertices?: Vertex[];
  normalizedVertices?: NormalizedVertex[];
}

export interface Vertex {
  x?: number;
  y?: number;
}

export interface NormalizedVertex {
  x: number;
  y: number;
}

export interface Entity {
  type?: string;
  mentionText?: string;
  mentionId?: string;
  confidence?: number;
  textAnchor?: TextAnchor;
  pageAnchor?: PageAnchor;
}

export interface PageAnchor {
  pageRefs?: PageRef[];
}

export interface PageRef {
  page?: number;
  boundingPoly?: BoundingPoly;
  confidence?: number;
}

export interface DetectedLanguage {
  languageCode?: string;
  confidence?: number;
}

export interface DetectedBreak {
  type?: string;
  isPrefix?: boolean;
}

// Application-specific types
export interface ExtractedParagraph {
  id: string;
  content: string;
  confidence: number;
  boundingBox: NormalizedVertex[];
  pageNumber: number;
  paragraphIndex: number;
}

export interface ProcessingState {
  isProcessing: boolean;
  isComplete: boolean;
  error: string | null;
}

export interface FileUploadState {
  file: File | null;
  fileName: string;
  content: string | null;
}