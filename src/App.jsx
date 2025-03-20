// src/App.jsx
import React, { useContext } from 'react'; // Import useContext
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Board from './pages/Board';
import Navbar from './components/Navbar';
import { DarkModeContext } from './context/DarkModeContext'; // Import DarkModeContext
import { BoardTitleProvider } from './context/BoardTitleContext';

function App() {
  const { isDarkMode } = useContext(DarkModeContext); // Get dark mode state

  return (
    <BoardTitleProvider>
      <Router>
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}> {/* Dynamic class application */}
          <Routes>
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/board/:boardId" element={<><Navbar /><Board /></>} />
          </Routes>
        </div>
      </Router>
    </BoardTitleProvider>
  );
}

export default App;