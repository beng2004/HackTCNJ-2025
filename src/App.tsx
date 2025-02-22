import { useState } from 'react';
import Board from './components/Board'
function App() {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [posts, setPosts] = useState([
    // { id: 1, title: 'Meeting at 3 PM', content: 'Don\'t forget to attend the team meeting!' },
    // { id: 2, title: 'Project Deadline', content: 'The project deadline is next Friday.' },
    // { id: 3, title: 'Team Lunch', content: 'We are having a team lunch tomorrow at 1 PM.' },
    // { id: 4, title: 'Office Closed', content: 'The office will be closed for maintenance next Monday.' },
    // { id: 5, title: 'New Software Update', content: 'The software update will be applied this weekend.' },
    // { id: 6, title: 'Quarterly Reviews', content: 'Quarterly performance reviews will begin next week.' },
    // { id: 7, title: 'Health & Safety', content: 'Don\'t forget to follow the new safety guidelines at work.' },
  ]);

  return (
    <div className="min-h-screen flex">
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
          <button className="bg-blue-500 text-white px-4 py-2 rounded">New Post</button>
        </header>

        {/* Scrollable Board Section */}
        <div className="bg-[#deb887] shadow-lg rounded-lg p-4 h-[calc(100vh-10rem)] overflow-y-auto">
          <Board/>
        </div>
      </main>
    </div>
  );
}

export default App;
