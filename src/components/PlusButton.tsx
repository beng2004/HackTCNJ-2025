import { useState } from 'react';
import { Plus } from 'lucide-react';

const ExpandablePlusButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Main plus button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-green-600 hover:bg-green-700 text-white rounded-full p-3 transition-all duration-300 z-20"
      >
        <Plus 
          size={40} 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-2 right-2 w-48 bg-orange-300 rounded-lg shadow-lg overflow-hidden border border-gray-200 z-10">
          <div className="pt-12">
            <button 
              onClick={() => console.log('New Flyer clicked')}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-400 hover:text-white transition-colors duration-200 block"
            >
              New Flyer
            </button>
            <button 
              onClick={() => console.log('New Post-it clicked')}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-400 hover:text-white transition-colors duration-200 block"
            >
              New Post-it
            </button>
          </div>
        </div>
      )}

      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ExpandablePlusButton;