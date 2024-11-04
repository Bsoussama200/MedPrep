import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

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

const MarkerSettings: React.FC<MarkerSettingsProps> = ({
  colors: initialColors,
  onClose,
  onSave,
}) => {
  const [colors, setColors] = useState<MarkerColor[]>(initialColors);
  const [newColor, setNewColor] = useState('#000000');
  const [newLabel, setNewLabel] = useState('');

  const handleAddColor = () => {
    if (newLabel.trim()) {
      setColors([
        ...colors,
        {
          color: newColor,
          label: newLabel.trim(),
          bgColor: `${newColor}33`,
        },
      ]);
      setNewColor('#000000');
      setNewLabel('');
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(colors);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Paramètres des marqueurs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="color"
                value={color.color}
                onChange={(e) => {
                  const newColors = [...colors];
                  newColors[index] = {
                    ...color,
                    color: e.target.value,
                    bgColor: `${e.target.value}33`,
                  };
                  setColors(newColors);
                }}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color.label}
                onChange={(e) => {
                  const newColors = [...colors];
                  newColors[index] = { ...color, label: e.target.value };
                  setColors(newColors);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Signification du marqueur"
              />
              <button
                onClick={() => handleRemoveColor(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nouvelle signification"
            />
            <button
              onClick={handleAddColor}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkerSettings;