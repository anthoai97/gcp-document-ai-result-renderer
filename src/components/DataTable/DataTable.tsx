'use client';

import { useState, useMemo, useEffect } from 'react';
import { ExtractedParagraph } from '../../types';
import styles from './DataTable.module.css';

interface DataTableProps {
  paragraphs: ExtractedParagraph[];
  selectedParagraph: ExtractedParagraph | null;
  onParagraphSelect: (paragraph: ExtractedParagraph) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
}

export default function DataTable({ 
  paragraphs, 
  selectedParagraph, 
  onParagraphSelect,
  currentPage,
  totalPages,
  onPageChange
}: DataTableProps) {
  const [selectedPageFilter, setSelectedPageFilter] = useState<number | 'all'>('all');

  // Sync page filter with current page from parent
  useEffect(() => {
    if (totalPages > 1) {
      setSelectedPageFilter(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handleRowClick = (paragraph: ExtractedParagraph) => {
    onParagraphSelect(paragraph);
  };

  const handlePageFilterChange = (pageFilter: number | 'all') => {
    setSelectedPageFilter(pageFilter);
    if (pageFilter !== 'all') {
      onPageChange(pageFilter - 1); // Convert to 0-based index
    }
  };

  // Get unique pages and filtered paragraphs
  const { uniquePages, filteredParagraphs } = useMemo(() => {
    const pages = [...new Set(paragraphs.map(p => p.pageNumber))].sort((a, b) => a - b);
    const filtered = selectedPageFilter === 'all' 
      ? paragraphs 
      : paragraphs.filter(p => p.pageNumber === selectedPageFilter);
    
    return {
      uniquePages: pages,
      filteredParagraphs: filtered
    };
  }, [paragraphs, selectedPageFilter]);

  if (paragraphs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No paragraphs extracted. Upload a document to see the data.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <div className={styles.headerTop}>
          <div>
            <h3>Extracted Paragraphs ({filteredParagraphs.length}/{paragraphs.length})</h3>
            {totalPages > 1 && selectedPageFilter !== 'all' && (
              <div className={styles.syncIndicator}>
                <div className={styles.syncDot}></div>
                <span>Synced with Page {selectedPageFilter}</span>
              </div>
            )}
          </div>
          {uniquePages.length > 1 && (
            <div className={styles.pageFilter}>
              <label htmlFor="pageSelect">Filter by page:</label>
              <select 
                id="pageSelect"
                value={selectedPageFilter} 
                onChange={(e) => handlePageFilterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className={styles.pageSelect}
              >
                <option value="all">All Pages</option>
                {uniquePages.map(page => (
                  <option key={page} value={page}>Page {page}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Index</th>
              <th>Content</th>
              <th>Confidence</th>
              <th>Page</th>
            </tr>
          </thead>
          <tbody>
            {filteredParagraphs.map((paragraph) => (
              <tr
                key={paragraph.id}
                className={`${styles.row} ${
                  selectedParagraph?.id === paragraph.id ? styles.selectedRow : ''
                }`}
                onClick={() => handleRowClick(paragraph)}
              >
                <td className={styles.indexCell}>
                  {paragraph.paragraphIndex + 1}
                </td>
                <td className={styles.contentCell}>
                  <div className={styles.contentText}>
                    {paragraph.content}
                  </div>
                </td>
                <td className={styles.confidenceCell}>
                  <span className={styles.confidenceBadge}>
                    {(paragraph.confidence * 100).toFixed(1)}%
                  </span>
                </td>
                <td className={styles.pageCell}>
                  {paragraph.pageNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}