import React from 'react';
import { Settings, X } from 'lucide-react';

interface MarkerColor {
  color: string;
  label: string;
  bgColor: string;
}

interface TextMarkerProps {
  position: { x: number; y: number } | null;
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
  colors,
}) => {
  if (!position) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      <div className="flex justify-between items-center mb-2 pb-2 border-b">
        <span className="text-sm font-medium text-gray-700">Marquer le texte</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {colors.map((color) => (
          <button
            key={color.color}
            onClick={() => onColorSelect(color)}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color.color }}
            />
            <span className="text-sm text-gray-700">{color.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 pt-2 border-t">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        >
          <Settings className="h-4 w-4" />
          Paramètres des marqueurs
        </button>
      </div>
    </div>
  );
};

export default TextMarker;