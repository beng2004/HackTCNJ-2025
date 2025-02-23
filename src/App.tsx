import { useState } from 'react';
import Board from './components/Board';
import BoardsGrid from './components/BoardsGrid';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Clipboard } from 'lucide-react';

type Section = 'daily' | 'bulletin';

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [boardId, setBoardId] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<Section>('daily');
  const [selectedBoardName, setSelectedBoardName] = useState<string>('');

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  const handleBoardSelect = (boardId: number, boardName: string) => {
    setBoardId(boardId);
    setSelectedBoardName(boardName);
  };

  const handleSectionSelect = (section: Section) => {
    setActiveSection(section);
    if (section === 'daily') {
      setBoardId(0);
      setSelectedBoardName('');
    } else {
      // Reset board selection when entering bulletin section
      setBoardId(-1);
      setSelectedBoardName('');
    }
  };

  return (
    isAuthenticated && (
      <div
        className="min-h-screen flex"
        style={{ cursor: `url('assets/thumbtack.png'), auto` }}
      >
        {/* Sidebar */}
        <aside
          className={`transition-all duration-300 ease-in-out ${
            isSidebarMinimized ? 'w-18' : 'w-64'
          } bg-gray-800 text-white p-4 relative flex flex-col`}
        >
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="absolute top-4 right-4 p-2"
          >
            <div className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}></div>
            <div className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}></div>
            <div className={`h-1 w-6 bg-white ${isSidebarMinimized ? '' : 'block'}`}></div>
          </button>

          {/* Sidebar Content */}
          <h1 className={`text-2xl font-semibold mb-6 ${isSidebarMinimized ? 'hidden' : ''}`}>
            Logo?
          </h1>

          {/* Section Navigation */}
          <nav className={`space-y-2 ${isSidebarMinimized ? 'hidden' : ''}`}>
            <button
              onClick={() => handleSectionSelect('daily')}
              className={`w-full flex items-center space-x-2 p-2 rounded transition-colors ${
                activeSection === 'daily' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Home size={20} />
              <span>Daily Board</span>
            </button>
            
            <button
              onClick={() => handleSectionSelect('bulletin')}
              className={`w-full flex items-center space-x-2 p-2 rounded transition-colors ${
                activeSection === 'bulletin' ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <Clipboard size={20} />
              <span>Bulletin Boards</span>
            </button>
          </nav>

          {/* Logout Button */}
          {!isSidebarMinimized && (
            <button
              onClick={() => logout({ logoutParams: { returnTo: 'http://localhost:5173/welcome' } })}
              className="bg-red-500 text-white py-2 px-4 rounded-lg mt-auto hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-6">
          <header className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-3xl font-semibold">
                  {activeSection === 'daily' ? 'Daily Board' : 'Bulletin Boards'}
                </h2>
                {selectedBoardName && (
                  <>
                    <ChevronRight className="text-gray-500" />
                    <span className="text-3xl font-semibold">{selectedBoardName}</span>
                  </>
                )}
              </div>
              <span className="text-lg font-semibold">Hello, {user.name}</span>
            </div>
            
            {/* Breadcrumb Navigation */}
            {activeSection === 'bulletin' && selectedBoardName && (
              <button
                onClick={() => {
                  setBoardId(-1);
                  setSelectedBoardName('');
                }}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ChevronRight className="rotate-180" size={16} />
                <span>Back to Boards</span>
              </button>
            )}
          </header>

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {activeSection === 'bulletin' && boardId === -1 ? (
              // Show BoardsGrid when in bulletin section and no board is selected
              <motion.div
                key="boards-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white shadow-lg rounded-lg h-[calc(100vh-10rem)] overflow-y-auto"
              >
                <BoardsGrid onBoardSelect={handleBoardSelect} />
              </motion.div>
            ) : (
              // Show selected board
              <motion.div
                key={boardId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="bg-[#deb887] shadow-lg rounded-lg h-[calc(100vh-10rem)] overflow-y-auto border-2 border-[#7B3F00]"
              >
                <Board boardId={boardId} setBoardId={setBoardId} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    )
  );
}

export default App;