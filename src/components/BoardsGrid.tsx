import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth0 } from "@auth0/auth0-react";


    // const [isPolling, setIsPolling] = useState(false)
    
    interface Board {
      id: number;
      name: string;
      type: string;
    }
    
    interface BoardsGridProps {
      onBoardSelect: (boardId: number, boardName: string) => void;
    }
    const makeNewBoard = async (item: Board, email) => {
      try {
        console.log(email)

        await axios.post('https://hack.tcnj.ngrok.app/boards', {
          boardId: item.id,
          boardName: item.name,
          boardType: item.type
        }, { headers: {
          'userId': email,
        }
        }, );
      } catch (error) {
        console.error('Error updating item position:', error);
      }
    };
    const BoardsGrid: React.FC<BoardsGridProps> = ({ onBoardSelect }) => {
  const { user } = useAuth0();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardType, setNewBoardType] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get('https://hack.tcnj.ngrok.app/boards', { headers: {
          'userId': user.email,
        }}, );
        console.log(user.email)

        console.log('API Response:', response.data);
        const boards: Board[] = response.data.map((item: any) => ({
          id: item.boardId,
          name: item.boardName,
          type: item.boardType,
        })).filter(Boolean);
        console.log(boards);
        setBoards(boards);
        setLoading(false);
      } catch (err) {
        setError('Failed to load boards');
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);



  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateBoard = async () => {
    console.log('Creating board:', newBoardName, newBoardType);
    const newId =  Math.floor(Math.random() * 1000000) + 1;
    
    // Create the new board object
    const newBoard = {
      id: newId,
      name: newBoardName,
      type: newBoardType
    };
  
    // Make the API call
    await makeNewBoard(newBoard, user.email);
    
    // Update local state immediately
    setBoards([...boards, newBoard]);
    
    // Reset form and close modal
    setNewBoardName('');
    setNewBoardType('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      
{boards.map((board) => (
    <motion.div
      key={board.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#deb887] shadow-lg rounded-lg overflow-y-auto border-2 border-[#7B3F00] cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => onBoardSelect(board.id, board.name)}
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{(board.name)}</h3>
        <p className="text-gray-600">{board.type}</p>
      </div>
    </motion.div>
  ))}

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center bg-gray-200 shadow-lg rounded-lg border-2 border-gray-400 cursor-pointer hover:shadow-xl transition-shadow p-6"
        onClick={() => setIsCreateModalOpen(true)}
      >
        <h3 className="text-xl font-semibold text-gray-600">+ Create New</h3>
      </motion.div>

      {isModalOpen && selectedBoard && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4"
          onClick={closeModal}
        >
          <div 
            className="relative bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>

            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">{selectedBoard.name}</h2>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-gray-600">Type: {selectedBoard.type}</p>
              <input
                placeholder="Enter details"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onBoardSelect(selectedBoard.id, selectedBoard.name)}
                  className="flex-1 px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Select Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">&times;</button>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Create New Board</h2>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Board Name" value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="Board Type" value={newBoardType} onChange={(e) => setNewBoardType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <button onClick={handleCreateBoard} className="w-full px-4 py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-600 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardsGrid;
