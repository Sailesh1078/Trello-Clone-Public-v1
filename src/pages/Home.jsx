// src/pages/Home.jsx
import React, { useContext } from 'react';
import BoardList from '../components/BoardList';
import { DarkModeContext } from '../context/DarkModeContext'; // Import DarkModeContext

function Home() {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div className={`pt-16 p-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <BoardList />
    </div>
  );
}

export default Home;