// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { FaMoon, FaSun, FaTrello } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom'; // Removed useParams
import { BoardTitleContext } from '../context/BoardTitleContext'; // Import BoardTitleContext

function Navbar() {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const { boardTitle } = useContext(BoardTitleContext); // Get boardTitle from context
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav className={`fixed top-0 w-full py-4 px-6 flex items-center shadow-md z-10 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-blue-700 text-white'}`}>
      <div className="flex items-center">
        <FaTrello size={24} className="mr-2" />
        <h1 onClick={handleGoHome} className="text-xl font-bold cursor-pointer">Trello Clone</h1>
      </div>
      <div className="flex-grow text-center">
        {location.pathname.startsWith('/board/') && boardTitle && (
          <h2 style={{ fontFamily: 'Arial, sans-serif' }} className="font-semibold">{boardTitle}</h2>
        )}
      </div>
      <div className="flex items-center">
        <button onClick={toggleDarkMode} className="focus:outline-none cursor-pointer">
          {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;