'use client';

import { useRef, useEffect, useState } from 'react';
import { DocumentProto, ExtractedParagraph } from '../../types';
import { normalizedToCanvasCoords } from '../../utils';
import styles from './DocumentViewer.module.css';

interface DocumentViewerProps {
  document: DocumentProto | null;
  paragraphs: ExtractedParagraph[];
  selectedParagraph: ExtractedParagraph | null;
  onParagraphSelect: (paragraph: ExtractedParagraph) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}

export default function DocumentViewer({
  document,
  paragraphs,
  selectedParagraph,
  onParagraphSelect,
  currentPage,
  totalPages,
  onPageChange
}: DocumentViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 800 });

  // Update canvas size based on document dimensions or container
  useEffect(() => {
    if (document && document.pages && document.pages[currentPage]) {
      const page = document.pages[currentPage];
      
      // Try to get dimensions from the document
      if (page.image) {
        // Use a reasonable aspect ratio for document display
        const aspectRatio = 8.5 / 11; // Standard letter size ratio
        const maxWidth = 600;
        const maxHeight = 800;
        
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        setCanvasSize({ width: Math.round(width), height: Math.round(height) });
      }
    }
  }, [document, currentPage]);

  useEffect(() => {
    if (!document || !document.pages || document.pages.length === 0) return;
    if (currentPage >= document.pages.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const page = document.pages[currentPage];
    const currentPageParagraphs = paragraphs.filter(p => p.pageNumber === currentPage + 1);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Function to render document content
    const renderDocument = () => {
      // Set canvas background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw document outline
      ctx.strokeStyle = '#dee2e6';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // If document has an image, render it
      if (page.image && page.image.content) {
        const img = new Image();
        img.onload = () => {
          // Draw the document image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // After image loads, draw paragraph highlights and text
          drawParagraphContent();
        };
        img.onerror = () => {
          console.warn('Failed to load document image, rendering text only');
          drawParagraphContent();
        };
        img.src = `data:image/png;base64,${page.image.content}`;
      } else {
        // No image available, render text content only
        drawParagraphContent();
      }
    };

    // Function to draw paragraph content and highlights
    const drawParagraphContent = () => {
      // Draw all paragraph bounding boxes lightly for current page
      currentPageParagraphs.forEach((paragraph) => {
        if (paragraph.boundingBox && paragraph.boundingBox.length > 0) {
          const coords = normalizedToCanvasCoords(
            paragraph.boundingBox,
            canvas.width,
            canvas.height
          );

          if (coords.length >= 4) {
            ctx.strokeStyle = '#e9ecef';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            
            ctx.beginPath();
            ctx.moveTo(coords[0].x, coords[0].y);
            for (let i = 1; i < coords.length; i++) {
              ctx.lineTo(coords[i].x, coords[i].y);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });

      // Highlight selected paragraph on current page
      if (selectedParagraph && selectedParagraph.pageNumber === currentPage + 1) {
        currentPageParagraphs.forEach((paragraph) => {
          if (paragraph.id === selectedParagraph.id && paragraph.boundingBox && paragraph.boundingBox.length > 0) {
            const coords = normalizedToCanvasCoords(
              paragraph.boundingBox,
              canvas.width,
              canvas.height
            );

            if (coords.length >= 4) {
              ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
              ctx.strokeStyle = '#8b5cf6';
              ctx.lineWidth = 3;
              ctx.setLineDash([]);

              ctx.beginPath();
              ctx.moveTo(coords[0].x, coords[0].y);
              for (let i = 1; i < coords.length; i++) {
                ctx.lineTo(coords[i].x, coords[i].y);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();

              // Draw text content if no image
              if (!page.image?.content && paragraph.content) {
                const minX = Math.min(...coords.map(c => c.x));
                const minY = Math.min(...coords.map(c => c.y));
                const maxX = Math.max(...coords.map(c => c.x));
                
                ctx.fillStyle = '#212529';
                ctx.font = '12px Arial, sans-serif';
                
                // Wrap text within bounding box
                const words = paragraph.content.split(' ');
                let line = '';
                let y = minY + 15;
                const lineHeight = 14;
                const maxWidth = maxX - minX - 10;
                
                for (let n = 0; n < words.length; n++) {
                  const testLine = line + words[n] + ' ';
                  const metrics = ctx.measureText(testLine);
                  const testWidth = metrics.width;
                  
                  if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, minX + 5, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                  } else {
                    line = testLine;
                  }
                }
                ctx.fillText(line, minX + 5, y);
              }
            }
          }
        });
      }

      // If no image available, render all text content for current page
      if (!page.image?.content) {
        currentPageParagraphs.forEach((paragraph) => {
          if (paragraph.boundingBox && paragraph.boundingBox.length > 0 && paragraph.content) {
            const coords = normalizedToCanvasCoords(
              paragraph.boundingBox,
              canvas.width,
              canvas.height
            );

            if (coords.length >= 4) {
              const minX = Math.min(...coords.map(c => c.x));
              const minY = Math.min(...coords.map(c => c.y));
              const maxX = Math.max(...coords.map(c => c.x));
              
              ctx.fillStyle = paragraph.id === selectedParagraph?.id ? '#8b5cf6' : '#6c757d';
              ctx.font = '11px Arial, sans-serif';
              
              // Simple text rendering
              const words = paragraph.content.split(' ');
              let line = '';
              let y = minY + 12;
              const lineHeight = 12;
              const maxWidth = maxX - minX - 6;
              
              for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                
                if (testWidth > maxWidth && n > 0) {
                  ctx.fillText(line, minX + 3, y);
                  line = words[n] + ' ';
                  y += lineHeight;
                  if (y > minY + 50) break; // Limit text height
                } else {
                  line = testLine;
                }
              }
              if (line.trim()) {
                ctx.fillText(line, minX + 3, y);
              }
            }
          }
        });
      }
    };

    renderDocument();
  }, [document, paragraphs, selectedParagraph, currentPage]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!document || !document.pages || document.pages.length === 0) return;
    if (currentPage >= document.pages.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const currentPageParagraphs = paragraphs.filter(p => p.pageNumber === currentPage + 1);

    // Check if click is within any paragraph bounds on current page
    for (const paragraph of currentPageParagraphs) {
      if (paragraph.boundingBox && paragraph.boundingBox.length > 0) {
        const coords = normalizedToCanvasCoords(
          paragraph.boundingBox,
          canvas.width,
          canvas.height
        );

        // Simple point-in-polygon check for rectangular bounds
        if (coords.length >= 4) {
          const minX = Math.min(...coords.map(c => c.x));
          const maxX = Math.max(...coords.map(c => c.x));
          const minY = Math.min(...coords.map(c => c.y));
          const maxY = Math.max(...coords.map(c => c.y));

          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            onParagraphSelect(paragraph);
            return;
          }
        }
      }
    }
  };

  const handlePrevPage = () => {
    onPageChange(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1));
  };

  const handlePageSelect = (pageIndex: number) => {
    onPageChange(pageIndex);
  };

  if (!document) {
    return (
      <div className={styles.placeholder}>
        <p>Upload a Document AI JSON file to view the document</p>
      </div>
    );
  }

  return (
    <div className={styles.viewerContainer}>
      {totalPages > 1 && (
        <div className={styles.pageNavigation}>
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 0}
            className={styles.navButton}
          >
            ← Previous
          </button>
          
          <div className={styles.pageInfo}>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <div className={styles.pageSelector}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageSelect(i)}
                  className={`${styles.pageButton} ${i === currentPage ? styles.activePage : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages - 1}
            className={styles.navButton}
          >
            Next →
          </button>
        </div>
      )}
      
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          className={styles.canvas}
        />
      </div>
    </div>
  );
}