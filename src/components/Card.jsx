// src/components/Card.jsx
import React, { useState, useRef, useEffect, useContext } from 'react'; // Import useContext
import { PencilIcon, TrashIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { CirclePicker } from 'react-color';
import { DarkModeContext } from '../context/DarkModeContext'; // Import DarkModeContext
import { db } from '../firebase/firebaseConfig'; // Import db
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

function Card({ card, onUpdateCard, onDeleteCard, parentListTintColor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(card.text);
    const editInputRef = useRef(null);
    const [showActions, setShowActions] = useState(false);
    const [cardTintColor, setCardTintColor] = useState(card.tintColor || null); // State for card tint color
    const [showCardColorPicker, setShowCardColorPicker] = useState(false); // State for card color picker visibility
    const tintIntensity = 0.3; // You can adjust this value (0 to 1)
    const { isDarkMode } = useContext(DarkModeContext); // Get dark mode state
    const [isDragging, setIsDragging] = useState(false); // State for dragging visual

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleEditTextChange = (event) => {
        setEditText(event.target.value);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
        onUpdateCard(card.id, editText);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(card.text);
    };

    const handleDeleteClick = () => {
        onDeleteCard(card.id);
    };

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    const getShadowColor = (baseColor) => {
        if (!baseColor) {
            return 'rgba(0,0,0,0.2)';
        }
        const rgbaValues = baseColor.substring(baseColor.indexOf('(') + 1, baseColor.lastIndexOf(')')).split(',');
        if (rgbaValues.length === 4) {
            const r = Math.max(0, parseInt(rgbaValues[0].trim()) - 30);
            const g = Math.max(0, parseInt(rgbaValues[1].trim()) - 30);
            const b = Math.max(0, parseInt(rgbaValues[2].trim()) - 30);
            const a = parseFloat(rgbaValues[3].trim());
            return `rgba(${r},${g},${b},${a})`;
        } else if (baseColor.startsWith('#')) {
            const hexToRgb = (hex) => {
                const bigint = parseInt(hex.slice(1), 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 0.8)`;
            };
            return hexToRgb(baseColor);
        }
        return 'rgba(0,0,0,0.2)';
    };

    const shadowColor = getShadowColor(parentListTintColor);

    const handleCardTintColorClick = (event) => {
        event.stopPropagation();
        setShowCardColorPicker(!showCardColorPicker);
    };

    const handleCardTintColorChangeComplete = async (color) => {
        setCardTintColor(color.hex);
        setShowCardColorPicker(false);
        const cardRef = doc(db, 'boards', card.boardId, 'lists', card.listId, 'cards', card.id);
        try {
            await updateDoc(cardRef, { tintColor: color.hex });
        } catch (error) {
            console.error("Error updating card tint color:", error);
        }
    };

    const hexToRgba = (hex, alpha) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getTintedBackgroundColor = () => {
        if (cardTintColor) {
            return hexToRgba(cardTintColor, tintIntensity);
        }
        return isDarkMode ? '#374151' : 'white'; // Default to white if no tint
    };

    const handleDragStart = (event) => {
        event.dataTransfer.setData('cardId', card.id);
        event.dataTransfer.setData('sourceListId', card.listId); // Use the listId prop of the card
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            className={`rounded-md p-2 mb-2 flex items-center hover:shadow-lg transition-shadow duration-150 relative break-words ${isDragging ? 'opacity-50' : ''} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            style={{ backgroundColor: getTintedBackgroundColor(), boxShadow: `0 2px 5px ${shadowColor}` }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div
                className="mr-2 cursor-grab"
                style={{ fontSize: '1.2em', opacity: 0.7, color: isDarkMode ? 'black' : 'inherit' }} // Override drag icon color
                draggable="true"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                &#8942;&#8942;
            </div>
            {isEditing ? (
                <input
                    type="text"
                    ref={editInputRef}
                    className="w-full rounded-md border p-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
                    value={editText}
                    onChange={handleEditTextChange}
                    onBlur={handleSaveEdit}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleSaveEdit();
                        } else if (event.key === 'Escape') {
                            handleCancelEdit();
                        }
                    }}
                />
            ) : (
                <div className="flex justify-between items-center w-full">
                    <span
                        className="text-sm break-words"
                        style={{
                            whiteSpace: 'normal',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-all',
                            color: isDarkMode ? 'black' : 'inherit', // Force text to black in dark mode
                        }}
                    >
                        {card.text}
                    </span>
                    <div className="flex items-center space-x-2">
                        {showActions && (
                            <>
                                <button onClick={handleEditClick} className="focus:outline-none hover:text-gray-600">
                                    <PencilIcon className={`h-4 w-4 ${isDarkMode ? 'text-black' : ''}`} /> {/* Override icon color */}
                                </button>
                                <button onClick={handleCardTintColorClick} className="focus:outline-none hover:text-gray-600">
                                    <PaintBrushIcon className={`h-4 w-4 cursor-pointer ${isDarkMode ? 'text-black' : ''}`} /> {/* Override icon color */}
                                </button>
                                <button onClick={handleDeleteClick} className="focus:outline-none hover:text-red-600">
                                    <TrashIcon className={`h-4 w-4 ${isDarkMode ? 'text-black' : ''}`} /> {/* Override icon color */}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showCardColorPicker && (
                <div className="absolute top-0 left-0 w-full h-full bg-black rounded-md bg-opacity-50 flex justify-center items-center z-20" onClick={() => setShowCardColorPicker(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <CirclePicker
                            colors={['#f44336', '#ffeb3b', '#4caf50', '#2196f3', '#ffffff']} // Red, Yellow, Green, Blue, White
                            color={cardTintColor || '#fff'}
                            onChangeComplete={handleCardTintColorChangeComplete}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Card;