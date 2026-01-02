'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DictionaryPopupProps {
  word: string;
  html: string;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  word,
  html,
  isOpen,
  onClose,
  onContinue,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Auto-continue when closing
      onContinue();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dictionary: {word}</DialogTitle>
        </DialogHeader>
        
        <div 
          className="dictionary-content prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Playing
          </button>
        </div>
        
        <style jsx global>{`
          .dictionary-content {
            font-family: system-ui, -apple-system, sans-serif;
          }
          .dictionary-content .word {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          .dictionary-content .phonetic {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 1rem;
          }
          .dictionary-content .meaning {
            margin-bottom: 1.5rem;
          }
          .dictionary-content .part-of-speech {
            font-size: 1.1rem;
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 0.5rem;
          }
          .dictionary-content .definitions {
            list-style-position: outside;
            padding-left: 1.5rem;
          }
          .dictionary-content .definitions li {
            margin-bottom: 0.75rem;
          }
          .dictionary-content .definition {
            color: #374151;
            line-height: 1.6;
          }
          .dictionary-content .example {
            color: #6b7280;
            margin-top: 0.25rem;
            font-size: 0.95em;
          }
          .dictionary-content .error {
            color: #dc2626;
            padding: 1rem;
            background-color: #fee2e2;
            border-radius: 0.5rem;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
