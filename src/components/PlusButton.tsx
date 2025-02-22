import { useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';

const ExpandablePlusButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');

  const handleNewFlyerClick = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImagePreview('');
    setCaption('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    closeModal();
  };

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
              onClick={handleNewFlyerClick}
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

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Create New Flyer</h2>
            </div>

            {/* Modal content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image upload area */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
                    ${imagePreview ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'}`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>

              {/* Caption input */}
              <div className="space-y-2">
                <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                  Caption
                </label>
                <textarea
                  id="caption"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter a caption for your flyer..."
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Flyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandablePlusButton;