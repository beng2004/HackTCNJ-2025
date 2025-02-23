import { useEffect, useState } from 'react';
import Board from './components/Board';
import BoardsGrid from './components/BoardsGrid';
import { useAuth0 } from '@auth0/auth0-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Clipboard, UserPlus, FileText, X } from 'lucide-react';
import axios from 'axios';

type Section = 'daily' | 'bulletin';

function App() {
  useEffect(() => {
    const addUser = async () => {
      try {
        await axios.post('https://hack.tcnj.ngrok.app/users/addUser', {
          userId: user?.email,
        }, { headers: {
          'userId': user?.email,
        }
        }, );
      } catch (error) {
        console.error('Error updating item position:', error);
      }
    };

    if (isAuthenticated && firstTime){
       addUser()
        setFirstTime(false)
      }

   });
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [boardId, setBoardId] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<Section>('daily');
  const [selectedBoardName, setSelectedBoardName] = useState<string>('');
  const [firstTime, setFirstTime] = useState<boolean>(true);
  const [isAddFriendsModalOpen, setIsAddFriendsModalOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

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
      setBoardId(-1);
      setSelectedBoardName('');
    }
  };

  const handleAddFriends = () => {
    setIsAddFriendsModalOpen(true);
  };

  const handleAISummary = async () => {
    // TODO: Implement AI summary functionality
    console.log('AI summary clicked');
  };

  const handleSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus({ message: '', type: null });

    try {
      const response = await axios.post('https://hack.tcnj.ngrok.app/users/shareBoard', {}, { headers: {
        boardId,
        friendEmail,}
      });

      setInviteStatus({
        message: 'Invitation sent successfully!',
        type: 'success'
      });
      setFriendEmail('');

      // Close modal after 2 seconds on success
      setTimeout(() => {
        setIsAddFriendsModalOpen(false);
        setInviteStatus({ message: '', type: null });
      }, 2000);

    } catch (error) {
      console.log(error)
    }
  };
  
  return (
    isAuthenticated && (
      <div
        className="min-h-screen flex"
        style={{ cursor: `url('assets/thumbtack.png'), auto` }}
      >
        
        <aside
          className={`transition-all duration-300 ease-in-out ${
            isSidebarMinimized ? 'w-18' : 'w-64'
          } bg-gray-800 text-white p-4 relative flex flex-col`}
        >
          {/* Sidebar content remains the same */}
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="absolute top-4 right-4 p-2"
          >
            <div className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}></div>
            <div className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}></div>
            <div className={`h-1 w-6 bg-white ${isSidebarMinimized ? '' : 'block'}`}></div>
          </button>

          <h1 className={`text-2xl font-semibold mb-6 ${isSidebarMinimized ? 'hidden' : ''}`}>
              <h1 className="flex items-center text-3xl font-extrabold dark:text-white">Post<span className="bg-blue-100 text-blue-800 text-2xl font-semibold me-2 px-2.5 py-0.5 rounded-sm dark:bg-[#FFFF00] dark:text-blue-800 ms-1">It</span></h1>
          </h1>

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
              <div className="flex items-center space-x-4">
                {boardId !== -1 && boardId !== 0 && (
                  <>
                    <button
                      onClick={handleAddFriends}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <UserPlus size={20} />
                      <span>Add Friends</span>
                    </button>
                    <button
                      onClick={handleAISummary}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FileText size={20} />
                      <span>AI Summary</span>
                    </button>
                  </>
                )}
                <span className="text-lg font-semibold">Hello, {user.name}</span>
              </div>
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

          {/* Add Friends Modal */}
          {isAddFriendsModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl p-6 w-full max-w-md relative"
              >
                <button
                  onClick={() => setIsAddFriendsModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>

                <h3 className="text-xl font-semibold mb-4">Invite Friends to Board</h3>
                

                <form onSubmit={handleSubmitInvite}>
                  <div className="mb-4">
                    <label htmlFor="friendEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Friend's Email
                    </label>
                    <input
                      type="email"
                      id="friendEmail"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {inviteStatus.message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      inviteStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {inviteStatus.message}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddFriendsModalOpen(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Send Invite
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    )
  );
}

export default App;