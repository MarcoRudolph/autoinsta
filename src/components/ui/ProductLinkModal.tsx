import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ProductLink {
  id: string;
  url: string;
  actionType: string;
  sendingBehavior: string;
}

interface ProductLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productLink: Omit<ProductLink, 'id'>) => void;
  onUpdate?: (productLink: ProductLink) => void;
  initialValue?: ProductLink;
  isEditing?: boolean;
  currentLocale?: string;
}

export default function ProductLinkModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialValue,
  isEditing = false,
  currentLocale = 'en'
}: ProductLinkModalProps) {
  const [url, setUrl] = useState('');
  const [actionType, setActionType] = useState('buy');
  const [sendingBehavior, setSendingBehavior] = useState('proactive');

  // Translations
  const translations = {
    en: {
      title: isEditing ? 'Edit Product Link' : 'Add Product Link',
      url: 'Product URL',
      urlPlaceholder: 'https://example.com/product',
      actionType: 'User should',
      sendingBehavior: 'Sending behavior',
      cancel: 'Cancel',
      save: isEditing ? 'Update' : 'Add',
      buy: 'buy',
      follow: 'follow',
      subscribe: 'subscribe',
      proactive: 'Send proactively',
      situational: 'Send in appropriate situation'
    },
    de: {
      title: isEditing ? 'Produktlink bearbeiten' : 'Produktlink hinzufügen',
      url: 'Produkt-URL',
      urlPlaceholder: 'https://beispiel.com/produkt',
      actionType: 'Benutzer soll',
      sendingBehavior: 'Versandverhalten',
      cancel: 'Abbrechen',
      save: isEditing ? 'Aktualisieren' : 'Hinzufügen',
      buy: 'kaufen',
      follow: 'folgen',
      subscribe: 'abonnieren',
      proactive: 'Proaktiv senden',
      situational: 'In passender Situation senden'
    }
  };

  const t = translations[currentLocale as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (isOpen) {
      if (initialValue) {
        setUrl(initialValue.url);
        setActionType(initialValue.actionType);
        setSendingBehavior(initialValue.sendingBehavior);
      } else {
        setUrl('');
        setActionType('buy');
        setSendingBehavior('proactive');
      }
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    if (url.trim()) {
      const productLink = {
        url: url.trim(),
        actionType,
        sendingBehavior
      };

      if (isEditing && initialValue && onUpdate) {
        onUpdate({
          ...productLink,
          id: initialValue.id
        });
      } else {
        onSave(productLink);
      }
      
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
            {t.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.url}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t.urlPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              autoFocus
            />
          </div>

          {/* Action Type Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.actionType}
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="buy">{t.buy}</option>
              <option value="follow">{t.follow}</option>
              <option value="subscribe">{t.subscribe}</option>
            </select>
          </div>

          {/* Sending Behavior Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.sendingBehavior}
            </label>
            <select
              value={sendingBehavior}
              onChange={(e) => setSendingBehavior(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="proactive">{t.proactive}</option>
              <option value="situational">{t.situational}</option>
            </select>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={!url.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t.save}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
