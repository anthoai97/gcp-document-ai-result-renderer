'use client';

import { useEffect, useState } from 'react';
import styles from './Entity.module.css';

const LAYER1 = 'layer1';

const VIOLET = 'rgba(139, 92, 246, 0.25)'; // Primary violet color
const BLUE = 'rgba(0, 0, 255, 0.25)';
const ORANGE = 'rgba(255,165,0, 0.25)';

interface ExtractedText {
  fieldName: string;
  fieldValue: string;
  confidence: number;
  bounding: { x: number; y: number }[];
}

interface EntityTabProps {
  processIsDone: boolean;
  processor: string;
  documentProto: any;
  onProcessIsDoneChange: (isDone: boolean) => void;
}

const EntityTab: React.FC<EntityTabProps> = ({
  processIsDone,
  processor,
  documentProto,
  onProcessIsDoneChange
}) => {
  const [dataSource, setDataSource] = useState<ExtractedText[]>([]);

  const clearAll = () => {
    [LAYER1].forEach(layerId => {
      const canvas = document.getElementById(layerId) as HTMLCanvasElement;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  };

  const getText = (textAnchor: any, text: string) => {
    if (!textAnchor || !textAnchor.textSegments || !text) return '';
    
    const segments = textAnchor.textSegments;
    let extractedText = '';
    
    segments.forEach((segment: { startIndex: number; endIndex: number }) => {
      extractedText += text.substring(segment.startIndex, segment.endIndex);
    });
    
    return extractedText;
  };

  const extractParagraphs = (data: ExtractedText[]) => {
    if (!documentProto || !documentProto.pages) {
      console.warn('No document pages available for paragraph extraction');
      return;
    }

    // Extract ONLY paragraphs from all pages
    documentProto.pages.forEach((page: any, pageIndex: number) => {
      if (page.paragraphs) {
        page.paragraphs.forEach((paragraph: any, paraIndex: number) => {
          const paraText = getText(paragraph.layout?.textAnchor, documentProto.text);
          if (paraText.trim()) {
            data.push({
              fieldName: `Paragraph ${pageIndex + 1}-${paraIndex + 1}`,
              fieldValue: paraText.trim(),
              confidence: paragraph.layout?.confidence || 0,
              bounding: paragraph.layout?.boundingPoly?.normalizedVertices || []
            });
          }
        });
      }
    });

    console.log(`Extracted ${data.length} paragraphs`);
    setDataSource([...data]);
  };

  const extractFormText = (data: ExtractedText[]) => {
    if (!documentProto || !documentProto.form) return;

    documentProto.form.fields?.forEach((field: any) => {
      if (field.fieldName && field.fieldValue) {
        data.push({
          fieldName: getText(field.fieldName.textAnchor, documentProto.text),
          fieldValue: getText(field.fieldValue.textAnchor, documentProto.text),
          confidence: field.confidence,
          bounding: field.fieldValue.boundingBox?.normalizedVertices || []
        });
      }
    });

    setDataSource([...data]);
  };

  const extractInvoiceText = (data: ExtractedText[]) => {
    if (!documentProto || !documentProto.invoice) return;

    Object.entries(documentProto.invoice).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === 'object' && value.textAnchor) {
        data.push({
          fieldName: key,
          fieldValue: getText(value.textAnchor, documentProto.text),
          confidence: value.confidence,
          bounding: value.boundingBox?.normalizedVertices || []
        });
      }
    });

    setDataSource([...data]);
  };

  const drawBoundingBox = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, vertices: any[], color: string) => {
    if (!vertices || vertices.length < 4) return;

    context.strokeStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    
    // Convert normalized coordinates to canvas coordinates
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const x1 = vertices[0].x * canvasWidth;
    const y1 = vertices[0].y * canvasHeight;
    
    context.moveTo(x1, y1);
    
    for (let i = 1; i < vertices.length; i++) {
      const x = vertices[i].x * canvasWidth;
      const y = vertices[i].y * canvasHeight;
      context.lineTo(x, y);
    }
    
    context.closePath();
    context.stroke();
    
    // Add a semi-transparent fill
    context.fillStyle = color.replace('1)', '0.1)');
    context.fill();
  };

  const highlightEntity = (item: ExtractedText, index: number) => {
    if (!item.bounding || item.bounding.length === 0) {
      console.warn('No bounding box data available for highlighting');
      return;
    }

    // Clear previous highlights
    clearAll();

    // Get the canvas element
    const canvas = document.getElementById(LAYER1) as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Cannot get canvas context');
      return;
    }

    // Draw the bounding box
    drawBoundingBox(context, canvas, item.bounding, 'rgba(139, 92, 246, 1)');
    
    console.log(`Highlighted ${item.fieldName} on canvas`);
  };

  useEffect(() => {
    if (processIsDone && documentProto) {
      clearAll();
      const newData: ExtractedText[] = [];

      // Extract only paragraphs
      extractParagraphs(newData);

      onProcessIsDoneChange(false);
    }
  }, [processIsDone, processor, documentProto]);

  return (
    <div className={styles.entityTab}>
      <div className={styles.statsBar}>
        <span className={styles.stat}>Total Paragraphs: <strong>{dataSource.length}</strong></span>
        <span className={styles.stat}>
          Avg Confidence: <strong>
            {dataSource.length > 0 
              ? ((dataSource.reduce((sum, item) => sum + item.confidence, 0) / dataSource.length) * 100).toFixed(1)
              : 0}%
          </strong>
        </span>
      </div>
      
      <div className={styles.tableContainer}>
        <table className={styles.entityTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Paragraph</th>
              <th>Content</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataSource.length > 0 ? (
              dataSource.map((item, index) => (
                <tr key={index} className={styles.entityRow}>
                  <td className={styles.indexCell}>{index + 1}</td>
                  <td className={styles.typeCell}>{item.fieldName}</td>
                  <td className={styles.contentCell} title={item.fieldValue}>
                    {item.fieldValue.length > 100 
                      ? item.fieldValue.substring(0, 100) + '...' 
                      : item.fieldValue}
                  </td>
                  <td className={styles.confidenceCell}>
                    <span className={`${styles.confidenceBadge} ${
                      item.confidence >= 0.8 ? styles.high : 
                      item.confidence >= 0.6 ? styles.medium : 
                      styles.low
                    }`}>
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={styles.highlightBtn}
                      onClick={() => highlightEntity(item, index)}
                      disabled={!item.bounding || item.bounding.length === 0}
                    >
                      📍 Highlight
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={styles.noData}>
                  {documentProto ? 'No paragraphs found in the document' : 'Please upload a JSON file to see paragraphs'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntityTab;