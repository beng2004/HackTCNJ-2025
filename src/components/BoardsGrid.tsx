import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Board {
  id: number;
  name: string;
  type: string;
}

interface BoardsGridProps {
  onBoardSelect: (boardId: number, boardName: string) => void;
}

const BoardsGrid: React.FC<BoardsGridProps> = ({ onBoardSelect }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get('https://hack.tcnj.ngrok.app/boards');
        console.log('API Response:', response.data);
        const boards: Board[] = response.data.map((item: any) => {
                return {
                    id: item.boardId,
                    name: item.boardName,
                    type: item.boardType
                } as Board;}).filter(Boolean); // Remove null values
        console.log(boards)
        setBoards(boards);
        setLoading(false);
      } catch (err) {
        setError('Failed to load boards');
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-gray-600">Loading boards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {boards.map((board) => (
        <motion.div
          key={board.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => onBoardSelect(board.id, board.name)}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{board.name}</h3>
            <p className="text-gray-600">{board.type}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default BoardsGrid;