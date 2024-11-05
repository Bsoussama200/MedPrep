import React from 'react';
import { Settings } from 'lucide-react';

interface MarkerColor {
  color: string;
  label: string;
  bgColor: string;
}

interface TextMarkerProps {
  position: { x: number; y: number };
  onClose: () => void;
  onColorSelect: (color: MarkerColor) => void;
  onOpenSettings: () => void;
  colors: MarkerColor[];
}

const TextMarker: React.FC<TextMarkerProps> = ({
  position,
  onClose,
  onColorSelect,
  onOpenSettings,
  colors
}) => {
  const calculatePosition = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const markerHeight = 250;
    const markerWidth = 200;
    
    let top = position.y;
    let left = position.x;

    if (top + markerHeight > windowHeight) {
      top = position.y - markerHeight - 20;
    }

    if (left + markerWidth > windowWidth) {
      left = windowWidth - markerWidth - 20;
    }

    return { top, left };
  };

  const { top, left } = calculatePosition();

  const handleColorSelect = (color: MarkerColor) => {
    onColorSelect(color);
    window.getSelection()?.removeAllRanges();
    onClose();
  };

  return (
    <div
      id="text-marker"
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50"
      style={{ top, left }}
    >
      <div className="space-y-2">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorSelect(color)}
            className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color.color }}
            />
            <span className="text-sm text-gray-700">{color.label}</span>
          </button>
        ))}
        <button
          onClick={onOpenSettings}
          className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
        >
          <Settings className="w-4 h-4" />
          Paramètres
        </button>
      </div>
    </div>
  );
};

export default TextMarker;