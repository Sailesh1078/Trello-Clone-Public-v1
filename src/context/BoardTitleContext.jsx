// src/context/BoardTitleContext.jsx
import React, { createContext, useState } from 'react';

export const BoardTitleContext = createContext();

export const BoardTitleProvider = ({ children }) => {
  const [boardTitle, setBoardTitle] = useState('');

  return (
    <BoardTitleContext.Provider value={{ boardTitle, setBoardTitle }}>
      {children}
    </BoardTitleContext.Provider>
  );
};