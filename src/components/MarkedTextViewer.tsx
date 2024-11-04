import React from 'react';
import { X } from 'lucide-react';

interface MarkerColor {
  color: string;
  label: string;
  bgColor: string;
}

interface MarkedText {
  text: string;
  color: MarkerColor;
  timestamp: number;
}

interface MarkedTextViewerProps {
  markedTexts: MarkedText[];
  onClose: () => void;
  selectedColor?: MarkerColor;
  onColorSelect: (color: MarkerColor | undefined) => void;
  colors: MarkerColor[];
}

const MarkedTextViewer: React.FC<MarkedTextViewerProps> = ({
  markedTexts,
  onClose,
  selectedColor,
  onColorSelect,
  colors,
}) => {
  const filteredTexts = selectedColor
    ? markedTexts.filter((mt) => mt.color.color === selectedColor.color)
    : markedTexts;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[800px] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Textes marqués</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => onColorSelect(undefined)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedColor
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {colors.map((color) => (
            <button
              key={color.color}
              onClick={() => onColorSelect(color)}
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                selectedColor?.color === color.color
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color.color }}
              />
              {color.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredTexts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucun texte marqué {selectedColor ? `en ${selectedColor.label}` : ''}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTexts.map((markedText, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200"
                  style={{ backgroundColor: markedText.color.bgColor }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: markedText.color.color }}
                    />
                    <span className="text-sm text-gray-600">
                      {markedText.color.label}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(markedText.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{markedText.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkedTextViewer;