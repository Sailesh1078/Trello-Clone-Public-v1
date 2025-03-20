// src/components/List.jsx
import React, { useState, useRef, useEffect, useContext } from 'react'; // Import useContext
import Card from './Card';
import { PencilIcon, TrashIcon, PaintBrushIcon } from '@heroicons/react/24/outline'; // Import icons
import { CirclePicker } from 'react-color'; // Import CirclePicker
import { DarkModeContext } from '../context/DarkModeContext'; // Import DarkModeContext
import { db } from '../firebase/firebaseConfig'; // Import db
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

function List({ list, onDrop, onAddCard, onUpdateCard, onDeleteCard, onUpdateListTitle, onDeleteList, onDragStartList, listTintColor }) {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardText, setNewCardText] = useState('');
    const addCardRef = useRef(null);
    const textareaRef = useRef(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for showing delete confirmation
    const [tintColor, setTintColor] = useState(list.tintColor || null); // Initialize with prop or from list data
    const [showColorPicker, setShowColorPicker] = useState(false); // New state
    const { isDarkMode } = useContext(DarkModeContext); // Get dark mode state
    const [showActions, setShowActions] = useState(false); // State to control visibility of actions

    useEffect(() => {
        if (list.tintColor && !tintColor) {
            setTintColor(list.tintColor);
        }
    }, [list.tintColor, tintColor]);

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        onDrop(event, list.id);
    };

    const handleAddCardClick = () => {
        setIsAddingCard(true);
    };

    const handleNewCardTextChange = (event) => {
        setNewCardText(event.target.value);
    };

    const handleSaveNewCard = () => {
        if (newCardText.trim()) {
            onAddCard(list.id, newCardText);
            setNewCardText('');
            setIsAddingCard(false);
        }
    };

    const handleCancelAddCard = () => {
        setIsAddingCard(false);
        setNewCardText('');
    };

    const handleTextareaKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSaveNewCard();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isAddingCard && addCardRef.current && !addCardRef.current.contains(event.target)) {
                if (textareaRef.current) {
                    textareaRef.current.blur();
                }
            }
        };

        if (isAddingCard) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAddingCard]);

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (title.trim() && title !== list.title) {
            onUpdateListTitle(list.id, title);
        } else {
            setTitle(list.title);
        }
    };

    const handleTitleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleTitleBlur();
        } else if (event.key === 'Escape') {
            setIsEditingTitle(false);
            setTitle(list.title);
        }
    };

    const handleDeleteListClick = () => {
        setShowDeleteConfirm(true); // Show the confirmation dialog
    };

    const confirmDeleteList = () => {
        onDeleteList(list.id);
        setShowDeleteConfirm(false); // Hide the dialog after deleting
    };

    const cancelDeleteList = () => {
        setShowDeleteConfirm(false); // Hide the dialog
    };

    const handleDragStart = (event) => {
        event.dataTransfer.setData('listId', list.id);
        if (onDragStartList) {
            onDragStartList(list.id);
        }
    };

    const handleTintColorClick = (event) => {
        event.stopPropagation();
        setShowColorPicker(!showColorPicker); // Toggle color picker visibility
    };

    const handleTintColorChangeComplete = async (color) => {
        setTintColor(color.hex);
        setShowColorPicker(false); // Hide picker after selection
        const listRef = doc(db, 'boards', list.boardId, 'lists', list.id);
        try {
            await updateDoc(listRef, { tintColor: color.hex });
        } catch (error) {
            console.error("Error updating list tint color:", error);
        }
    };

    const getShadowColor = (baseColor) => {
        if (!baseColor) {
            return 'rgba(0,0,0,1)'; // Default shadow color - increased intensity
        }
        const rgbaValues = baseColor.substring(baseColor.indexOf('(') + 1, baseColor.lastIndexOf(')')).split(',');
        let shadowDarkness = 100; // Increased darkness for more intensity
        if (rgbaValues.length === 4) {
            const r = Math.max(0, parseInt(rgbaValues[0].trim()) - shadowDarkness);
            const g = Math.max(0, parseInt(rgbaValues[1].trim()) - shadowDarkness);
            const b = Math.max(0, parseInt(rgbaValues[2].trim()) - shadowDarkness);
            const a = parseFloat(rgbaValues[3].trim());
            return `rgba(${r},${g},${b},${a})`;
        } else if (baseColor.startsWith('#')) {
            const hexToRgb = (hex) => {
                const bigint = parseInt(hex.slice(1), 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${Math.max(0, r - shadowDarkness)}, ${Math.max(0, g - shadowDarkness)}, ${Math.max(0, b - shadowDarkness)}, 0.8)`; // Assuming opacity of 0.8
            };
            return hexToRgb(baseColor);
        }
        return 'rgba(0,0,0,1)'; // Fallback
    };

    const tintAmount = 0.25; // Adjust this value (0.0 to 1.0) to control the tint intensity

    const getTintedBackgroundColor = () => {
        if (!tintColor) {
            return isDarkMode ? 'rgba(55, 65, 81, 1)' : ''; // Dark mode default list background
        }
        const r = parseInt(tintColor.slice(1, 3), 16);
        const g = parseInt(tintColor.slice(3, 5), 16);
        const b = parseInt(tintColor.slice(5, 7), 16);

        return `rgba(${r}, ${g}, ${b}, ${tintAmount})`;
    };

    return (
        <div
            className={`rounded-md shadow-md p-4 w-80 flex-shrink-0 hover:shadow-lg transition-shadow duration-150 relative ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
            style={{
                backgroundColor: getTintedBackgroundColor(),
                boxShadow: `0 2px 5px ${getShadowColor(tintColor)}`,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex justify-between items-center mb-2">
                <div
                    className="mr-2 cursor-grab"
                    style={{ fontSize: '1.2em', opacity: 0.7 }}
                    draggable="true"
                    onDragStart={handleDragStart}
                >
                    &#8942;&#8942;
                </div>
                {isEditingTitle ? (
                    <input
                        type="text"
                        className={`font-semibold text-lg focus:outline-none focus:ring focus:border-blue-300 rounded-md p-1 w-full ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        autoFocus
                    />
                ) : (
                    <h3
                        className={`font-semibold mb-2 w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                        style={{
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-all',
                        }}
                    >
                        {list.title}
                    </h3>
                )}
                <div className="flex items-center space-x-2" style={{ visibility: showActions && !isEditingTitle ? 'visible' : 'hidden' }}>
                    {!isEditingTitle && (
                        <button onClick={() => setIsEditingTitle(true)} className="focus:outline-none hover:text-gray-600">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                    )}
                    <button onClick={handleTintColorClick} className="focus:outline-none hover:text-gray-600">
                        <PaintBrushIcon className="h-5 w-5 cursor-pointer" />
                    </button>
                    <button onClick={handleDeleteListClick} className="focus:outline-none hover:text-red-600">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {showColorPicker && (
                <div className="absolute top-0 left-0 w-full h-full bg-black rounded-md bg-opacity-50 flex justify-center items-center z-10" onClick={() => setShowColorPicker(false)}>
                    <div onClick={(e) => e.stopPropagation()}> {/* Prevent backdrop click from closing if clicking inside */}
                        <CirclePicker
                            color={tintColor || '#fff'} // Use current tint color or default to white
                            onChangeComplete={handleTintColorChangeComplete}
                        />
                    </div>
                </div>
            )}

            <div className="pt-2 pb-2">
                {list.cards.map((card) => (
                    <Card
                        key={card.id}
                        card={card}
                        onUpdateCard={onUpdateCard}
                        onDeleteCard={onDeleteCard}
                        parentListTintColor={tintColor} // Pass the list's tint color to the card
                    />
                ))}
            </div>

            {isAddingCard ? (
                <div className="mt-2" ref={addCardRef}>
                    <textarea
                        className={`w-full rounded-md border p-2 mb-1 ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}
                        placeholder="Enter card title..."
                        value={newCardText}
                        onChange={handleNewCardTextChange}
                        onKeyDown={handleTextareaKeyDown}
                        autoFocus
                        ref={textareaRef}
                    />
                    <div className="flex">
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            onClick={handleSaveNewCard}
                        >
                            Add Card
                        </button>
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleCancelAddCard}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2 w-full text-left ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={handleAddCardClick}
                >
                    + Add a card
                </button>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed top-0 left-0 w-full h-full bg-transparent flex justify-center items-center z-50">
                    <div className={`bg-gray-200 rounded-md shadow-xl p-6 w-80 ${isDarkMode ? 'bg-gray-800 text-white' : ''}`}>
                        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Delete List</h2>
                        <p className={`text-gray-700 mb-4 ${isDarkMode ? 'text-gray-300' : ''}`}>
                            Are you sure you want to delete the list "{list.title}" and all its cards?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-center space-x-2">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring focus:ring-blue-300"
                                onClick={cancelDeleteList}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring focus:ring-blue-300"
                                onClick={confirmDeleteList}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default List;