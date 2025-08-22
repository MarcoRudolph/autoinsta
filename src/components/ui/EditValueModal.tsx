import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface EditValueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (oldValue: string, newValue: string) => void;
  title: string;
  currentValue: string;
  placeholder: string;
  subtitle?: string;
  buttonText?: string;
  cancelText?: string;
  editText?: string;
  locale?: string;
}

export default function EditValueModal({
  isOpen,
  onClose,
  onSave,
  title,
  currentValue,
  placeholder,
  subtitle,
  buttonText,
  cancelText,
  editText,
  locale = 'en'
}: EditValueModalProps) {
  const [value, setValue] = useState(currentValue);

  // Simple translation function for this component
  const t = (key: string) => {
    const translations = {
      en: {
        editValue: 'Edit Value',
        editValueFor: 'Edit the value for',
        cancel: 'Cancel',
        update: 'Update'
      },
      de: {
        editValue: 'Wert bearbeiten',
        editValueFor: 'Bearbeite den Wert für',
        cancel: 'Abbrechen',
        update: 'Aktualisieren'
      }
    };
    
    return translations[locale as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue, isOpen]);

  const handleSave = () => {
    if (value.trim() && value.trim() !== currentValue) {
      onSave(currentValue, value.trim());
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
            {editText || t('editValue')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            {subtitle || `${t('editValueFor')} "${title}"`}
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
            {cancelText || t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim() || value.trim() === currentValue}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {buttonText || t('update')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

