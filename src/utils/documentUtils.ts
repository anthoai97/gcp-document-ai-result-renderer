import { TextAnchor, DocumentProto, Paragraph, ExtractedParagraph, NormalizedVertex } from '../types';

/**
 * Extracts text content from Document AI text anchor
 */
export function extractTextFromAnchor(textAnchor: TextAnchor | undefined, fullText: string): string {
  if (!textAnchor || !textAnchor.textSegments || !fullText) {
    return '';
  }

  let extractedText = '';
  textAnchor.textSegments.forEach(segment => {
    if (segment.startIndex !== undefined && segment.endIndex !== undefined) {
      extractedText += fullText.substring(segment.startIndex, segment.endIndex);
    }
  });

  return extractedText.trim();
}

/**
 * Extracts all paragraphs from Document AI response
 */
export function extractParagraphs(documentProto: DocumentProto): ExtractedParagraph[] {
  if (!documentProto?.pages) {
    return [];
  }

  const paragraphs: ExtractedParagraph[] = [];
  
  documentProto.pages.forEach((page, pageIndex) => {
    if (page.paragraphs) {
      page.paragraphs.forEach((paragraph, paragraphIndex) => {
        const content = extractTextFromAnchor(paragraph.layout?.textAnchor, documentProto.text || '');
        
        if (content) {
          paragraphs.push({
            id: `page-${pageIndex}-para-${paragraphIndex}`,
            content,
            confidence: paragraph.layout?.confidence || 0,
            boundingBox: paragraph.layout?.boundingPoly?.normalizedVertices || [],
            pageNumber: pageIndex + 1,
            paragraphIndex: paragraphIndex + 1
          });
        }
      });
    }
  });

  return paragraphs;
}

/**
 * Validates if the uploaded content is valid JSON
 */
export function validateJsonContent(content: string): { isValid: boolean; error?: string } {
  try {
    JSON.parse(content);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format' 
    };
  }
}

/**
 * Checks if a file has valid JSON extension
 */
export function isJsonFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';
}

/**
 * Converts normalized coordinates to canvas coordinates
 */
export function normalizedToCanvasCoords(
  normalized: NormalizedVertex[], 
  canvasWidth: number, 
  canvasHeight: number
): { x: number; y: number }[] {
  return normalized.map(vertex => ({
    x: vertex.x * canvasWidth,
    y: vertex.y * canvasHeight
  }));
}

/**
 * Calculates average confidence from a list of paragraphs
 */
export function calculateAverageConfidence(paragraphs: ExtractedParagraph[]): number {
  if (paragraphs.length === 0) return 0;
  
  const sum = paragraphs.reduce((acc, paragraph) => acc + paragraph.confidence, 0);
  return sum / paragraphs.length;
}