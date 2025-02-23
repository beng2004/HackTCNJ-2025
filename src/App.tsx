import { useState } from 'react';
import Board from './components/Board'
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  if (isLoading) {
    return <div>Loading ...</div>;
  }
  console.log(isAuthenticated)

  return (
    <div className="min-h-screen flex" style={{ cursor: `url('assets/thumbtack.png'), auto`  }}>
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out ${
          isSidebarMinimized ? 'w-18' : 'w-64'
        } bg-gray-800 text-white p-4 relative`}
      >
        {/* Hamburger Menu (3 lines) Button */}
        <button
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="absolute top-4 right-4 p-2"
        >
          <div
            className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}
          ></div>
          <div
            className={`h-1 w-6 bg-white mb-2 ${isSidebarMinimized ? '' : 'block'}`}
          ></div>
          <div
            className={`h-1 w-6 bg-white ${isSidebarMinimized ? '' : 'block'}`}
          ></div>
        </button>

        {/* Sidebar Content */}
        <h1
          className={`text-2xl font-semibold mb-6 ${isSidebarMinimized ? 'hidden' : ''}`}
        >
          Logo? 
        </h1>
        <ul>
          <li className={`mb-4 hover:bg-gray-700 p-2 rounded ${isSidebarMinimized ? 'hidden' : ''}`}>
            Home
          </li>
          <li className={`mb-4 hover:bg-gray-700 p-2 rounded ${isSidebarMinimized ? 'hidden' : ''}`}>
            Announcements
          </li>
          <li className={`mb-4 hover:bg-gray-700 p-2 rounded ${isSidebarMinimized ? 'hidden' : ''}`}>
            Messages
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Your Board</h2>
        </header>

        {/* Scrollable Board Section */}
        <div className="bg-[#deb887] shadow-lg rounded-lg  h-[calc(100vh-10rem)] overflow-y-auto border-2 border-[#7B3F00]">
          <Board/>
        </div>
      </main>
    </div>
  );
}

export default App;
