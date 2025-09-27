'use client';

import { useState, useEffect } from 'react';
import { FileUpload, DocumentViewer, DataTable } from '../components';
import { useDocumentProcessor } from '../hooks';
import { ExtractedParagraph } from '../types';

export default function Home() {
  const {
    processingState,
    fileState,
    document,
    paragraphs,
    processFile,
  } = useDocumentProcessor();

  const [selectedParagraph, setSelectedParagraph] = useState<ExtractedParagraph | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Update total pages when document changes
  useEffect(() => {
    if (document && document.pages) {
      setTotalPages(document.pages.length);
      setCurrentPage(0);
      setSelectedParagraph(null); // Reset selection when document changes
    } else {
      setTotalPages(0);
      setCurrentPage(0);
    }
  }, [document]);

  const handleFileSelect = (file: File) => {
    processFile(file);
    setSelectedParagraph(null); // Reset selection when new file is uploaded
    setCurrentPage(0); // Reset to first page
  };

  const handleParagraphSelect = (paragraph: ExtractedParagraph) => {
    setSelectedParagraph(paragraph);
    // Auto-navigate to the page containing the selected paragraph
    if (paragraph.pageNumber !== currentPage + 1) {
      setCurrentPage(paragraph.pageNumber - 1);
    }
  };

  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
    // Clear selection if the selected paragraph is not on the new page
    if (selectedParagraph && selectedParagraph.pageNumber !== pageIndex + 1) {
      setSelectedParagraph(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-4 px-[10%]">
      <div className="w-full min-h-full flex flex-col">


        {processingState.error && (
          <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-xl flex-shrink-0 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                <p className="mt-1 text-sm text-red-700">{processingState.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-h-0">
          {/* Document Processing Section */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl shadow-lg border border-violet-200 p-6 mb-6 flex-shrink-0">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Document Processing - Document AI Renderer</h2>
                <p className="text-sm text-gray-600 mt-1 mb-2">
                  Handles rendering OCR processor response JSON files from GCP Document AI service
                </p>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    OCR Processor Active
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Function Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Document
                </h3>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isProcessing={processingState.isProcessing}
                />
                
                {fileState.fileName && (
                  <div className="mt-4 p-4 bg-white/70 backdrop-blur-sm border border-violet-200 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 text-violet-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <h4 className="font-semibold text-gray-800">Processing Status</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong className="text-violet-700">File:</strong> {fileState.fileName}
                        </p>
                        {document && document.pages && (
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                              </svg>
                              {document.pages.length} {document.pages.length === 1 ? 'page' : 'pages'}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              {paragraphs.length} paragraphs
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {processingState.isComplete && (
                        <div className="flex items-center ml-4">
                          <div className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Processed
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Authorities Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Developer Information
                </h3>
                <div className="bg-white/70 backdrop-blur-sm border border-violet-200 rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600 mb-3">This application was developed by:</p>
                  <a 
                    href="https://github.com/anthoai97" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-white hover:bg-violet-50 border border-violet-200 rounded-lg transition-all duration-200 hover:shadow-md group hover:border-violet-300"
                  >
                    <svg className="w-8 h-8 text-gray-700 mr-3 group-hover:text-violet-600 transition-colors flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-base font-semibold text-gray-800 group-hover:text-violet-700 transition-colors">@anthoai97</span>
                      <span className="text-sm text-gray-500 group-hover:text-violet-500 transition-colors">GitHub Profile</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-violet-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <div className="mt-3 pt-3 border-t border-violet-100">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded-full">Next.js</span>
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">React</span>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">TypeScript</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Document AI Processing System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Viewer and Data Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
            <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 flex flex-col hover:shadow-xl transition-shadow duration-300 min-h-[600px]">
              <div className="flex items-center mb-4 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Canvas Visualization</h2>
                  {totalPages > 1 && (
                    <span className="text-sm font-medium text-violet-600">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <DocumentViewer
                  document={document}
                  paragraphs={paragraphs}
                  selectedParagraph={selectedParagraph}
                  onParagraphSelect={handleParagraphSelect}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-violet-100 p-6 flex flex-col hover:shadow-xl transition-shadow duration-300 min-h-[600px]">
              <div className="flex items-center mb-4 flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Extracted Paragraphs</h2>
                  {totalPages > 1 && (
                    <span className="text-sm font-medium text-violet-600">
                      Synced with Canvas
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <DataTable
                  paragraphs={paragraphs}
                  selectedParagraph={selectedParagraph}
                  onParagraphSelect={handleParagraphSelect}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}