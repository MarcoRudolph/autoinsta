import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface AddValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  placeholder: string;
  initialValue?: string;
  isEditing?: boolean;
}

export default function AddValueModal({
  isOpen,
  onClose,
  onSave,
  title,
  placeholder,
  initialValue = '',
  isEditing = false
}: AddValueModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue, isOpen]);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
      setValue('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-gray-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Wert bearbeiten' : 'Neuen Wert hinzufügen'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            {isEditing 
              ? `Bearbeite den Wert für "${title}"`
              : `Füge einen neuen Wert zur Kategorie "${title}" hinzu`
            }
          </p>
          
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            autoFocus
          />
        </div>

        <DialogFooter className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
