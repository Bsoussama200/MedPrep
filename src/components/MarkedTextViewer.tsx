import React from 'react';
import { X, Filter, Clock, Search } from 'lucide-react';

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
  colors
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest'>('newest');

  const filteredTexts = markedTexts
    .filter(mt => {
      const matchesColor = selectedColor ? mt.color.color === selectedColor.color : true;
      const matchesSearch = searchTerm 
        ? mt.text.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesColor && matchesSearch;
    })
    .sort((a, b) => {
      return sortBy === 'newest' 
        ? b.timestamp - a.timestamp 
        : a.timestamp - b.timestamp;
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-[90vw] h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Textes marqués</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 border-b space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher dans les textes marqués..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onColorSelect(undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedColor
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => onColorSelect(color)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  selectedColor?.color === color.color
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color.color }}
                />
                {color.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTexts.map((markedText, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                style={{ backgroundColor: markedText.color.bgColor }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: markedText.color.color }}
                  />
                  <span className="font-medium text-gray-900">
                    {markedText.color.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(markedText.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-lg text-gray-900 whitespace-pre-wrap font-serif leading-relaxed">
                  {markedText.text}
                </p>
              </div>
            ))}
          </div>
          {filteredTexts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-3">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun texte marqué trouvé
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Essayez de modifier vos critères de recherche"
                  : selectedColor 
                    ? "Aucun texte marqué avec cette couleur"
                    : "Commencez à marquer du texte pour le retrouver ici"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkedTextViewer;