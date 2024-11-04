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
  // Calculate position to ensure the marker window stays within viewport
  const calculatePosition = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const markerHeight = 250; // Approximate height of marker window
    const markerWidth = 200; // Approximate width of marker window
    
    let top = position.y;
    let left = position.x;

    // Adjust vertical position if too close to bottom
    if (top + markerHeight > windowHeight) {
      top = position.y - markerHeight - 20; // Position above the selection
    }

    // Adjust horizontal position if too close to right edge
    if (left + markerWidth > windowWidth) {
      left = windowWidth - markerWidth - 20;
    }

    return { top, left };
  };

  const { top, left } = calculatePosition();

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50"
      style={{ top, left }}
    >
      <div className="space-y-2">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => onColorSelect(color)}
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