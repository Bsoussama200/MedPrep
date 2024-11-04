import React, { useState } from 'react';
import { X, Plus, Settings } from 'lucide-react';

interface MarkerColor {
  color: string;
  label: string;
  bgColor: string;
}

interface MarkerSettingsProps {
  colors: MarkerColor[];
  onClose: () => void;
  onSave: (colors: MarkerColor[]) => void;
}

const MarkerSettings: React.FC<MarkerSettingsProps> = ({ colors, onClose, onSave }) => {
  const [editedColors, setEditedColors] = useState<MarkerColor[]>(colors);

  const handleColorChange = (index: number, field: keyof MarkerColor, value: string) => {
    const newColors = [...editedColors];
    if (field === 'color') {
      newColors[index] = {
        ...newColors[index],
        color: value,
        bgColor: value + '33' // Add 20% opacity
      };
    } else {
      newColors[index] = {
        ...newColors[index],
        [field]: value
      };
    }
    setEditedColors(newColors);
  };

  const handleSave = () => {
    onSave(editedColors);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Paramètres des marqueurs</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {editedColors.map((color, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="color"
                value={color.color}
                onChange={(e) => handleColorChange(index, 'color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color.label}
                onChange={(e) => handleColorChange(index, 'label', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Signification du marqueur"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkerSettings;