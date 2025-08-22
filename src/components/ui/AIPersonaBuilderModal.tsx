import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface AIPersonaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  loading?: boolean;
}

export default function AIPersonaBuilderModal({
  isOpen,
  onClose,
  onGenerate,
  loading = false
}: AIPersonaBuilderModalProps) {
  const [prompt, setPrompt] = useState('random');

  const handleGenerate = () => {
    onGenerate(prompt.trim() || 'random');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Prompt</DialogTitle>
          <DialogDescription className="text-gray-600">
            Describe the persona or keep it random
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your desired persona or leave as 'random'"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 min-h-[100px] resize-none"
            disabled={loading}
          />
                     <p className="text-xs text-gray-500 mt-2">
             Tip: Be specific about personality traits, background, or style. Use "random" for AI-generated creativity.
           </p>
           <p className="text-xs text-orange-500 mt-1">
             ⚠️ Content Guidelines: Avoid sexual, violent, illegal, or hateful content. Your prompt will be checked for safety.
           </p>
        </div>

        <DialogFooter className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
