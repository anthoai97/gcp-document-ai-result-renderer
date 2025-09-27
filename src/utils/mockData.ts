// Test data to verify canvas rendering works with multiple pages
export const mockDocumentData = {
  "text": "Invoice\n\nBill To:\nJohn Smith\n123 Main Street\nAnytown, ST 12345\n\nInvoice Number: INV-001\nDate: 2024-01-15\nDue Date: 2024-02-15\n\nDescription\tQuantity\tRate\tAmount\nWebsite Design\t1\t$2,500.00\t$2,500.00\nLogo Design\t1\t$500.00\t$500.00\n\nSubtotal: $3,000.00\nTax: $240.00\nTotal: $3,240.00\n\nPage 2 Content:\nTerms and Conditions\nPayment is due within 30 days\nLate fees may apply",
  "pages": [
    {
      "pageNumber": 1,
      "paragraphs": [
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 0, "endIndex": 7}],
              "content": "Invoice"
            },
            "confidence": 0.98,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.1},
                {"x": 0.3, "y": 0.1},
                {"x": 0.3, "y": 0.15},
                {"x": 0.1, "y": 0.15}
              ]
            }
          }
        },
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 9, "endIndex": 18}],
              "content": "Bill To:"
            },
            "confidence": 0.95,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.2},
                {"x": 0.25, "y": 0.2},
                {"x": 0.25, "y": 0.24},
                {"x": 0.1, "y": 0.24}
              ]
            }
          }
        },
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 19, "endIndex": 29}],
              "content": "John Smith"
            },
            "confidence": 0.97,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.25},
                {"x": 0.35, "y": 0.25},
                {"x": 0.35, "y": 0.29},
                {"x": 0.1, "y": 0.29}
              ]
            }
          }
        },
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 100, "endIndex": 120}],
              "content": "Website Design"
            },
            "confidence": 0.96,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.5},
                {"x": 0.4, "y": 0.5},
                {"x": 0.4, "y": 0.55},
                {"x": 0.1, "y": 0.55}
              ]
            }
          }
        }
      ]
    },
    {
      "pageNumber": 2,
      "paragraphs": [
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 200, "endIndex": 220}],
              "content": "Terms and Conditions"
            },
            "confidence": 0.94,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.1},
                {"x": 0.5, "y": 0.1},
                {"x": 0.5, "y": 0.15},
                {"x": 0.1, "y": 0.15}
              ]
            }
          }
        },
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 221, "endIndex": 250}],
              "content": "Payment is due within 30 days"
            },
            "confidence": 0.92,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.2},
                {"x": 0.6, "y": 0.2},
                {"x": 0.6, "y": 0.24},
                {"x": 0.1, "y": 0.24}
              ]
            }
          }
        },
        {
          "layout": {
            "textAnchor": {
              "textSegments": [{"startIndex": 251, "endIndex": 270}],
              "content": "Late fees may apply"
            },
            "confidence": 0.93,
            "boundingPoly": {
              "normalizedVertices": [
                {"x": 0.1, "y": 0.25},
                {"x": 0.4, "y": 0.25},
                {"x": 0.4, "y": 0.29},
                {"x": 0.1, "y": 0.29}
              ]
            }
          }
        }
      ]
    }
  ]
};