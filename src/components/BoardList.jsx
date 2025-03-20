// src/components/BoardList.jsx
import React, { useState, useRef, useEffect, memo } from 'react'; // Import memo
import { Link } from 'react-router-dom';
import { FaTh, FaPencilAlt, FaTrash, FaPalette, FaPlus } from 'react-icons/fa'; // Import FaPlus for add board
import { CirclePicker } from 'react-color'; // Import CirclePicker
import { db } from '../firebase/firebaseConfig'; // Import Firestore instance with the corrected path
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'; // Import query and orderBy

function BoardList() {
    const [boards, setBoards] = useState(); // Initialize as empty array
    const [isCreatingInline, setIsCreatingInline] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [newBoardDescription, setNewBoardDescription] = useState(''); // New state for description
    const [newBoardColor, setNewBoardColor] = useState('#FFFFFF'); // Default color (white)
    const [editingBoardId, setEditingBoardId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editDescription, setEditDescription] = useState(''); // New state for editing description
    const [changingColorBoardId, setChangingColorBoardId] = useState(null);
    const [currentColor, setCurrentColor] = useState('#B38BFA');
    const [changingTintColorBoardId, setChangingTintColorBoardId] = useState(null);
    const [currentTintColor, setCurrentTintColor] = useState(null);
    const editTitleRef = useRef(null);
    const editDescriptionRef = useRef(null);
    const [showActions, setShowActions] = useState(null); // State to control visibility of actions for each board

    const boardsCollectionRef = collection(db, 'boards'); // Get a reference to the 'boards' collection
    const listsCollectionRef = collection(db, 'lists'); // Reference to the 'lists' collection
    const cardsCollectionRef = collection(db, 'cards'); // Reference to the 'cards' collection

    useEffect(() => {
        const orderedBoardsQuery = query(boardsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(orderedBoardsQuery, (snapshot) => {
            const boardsData =[];
            snapshot.forEach((doc) => {
                boardsData.push({ id: doc.id, ...doc.data() });
            });
            setBoards(boardsData);
        }, (error) => {
            console.error("Error fetching boards: ", error);
        });

        // Function to handle Escape key press
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isCreatingInline) {
                setIsCreatingInline(false);
                setNewBoardTitle('');
                setNewBoardDescription('');
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('keydown', handleEscape);

        // Remove event listener when the component unmounts
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isCreatingInline]); // Re-run effect if isCreatingInline changes

    const handleCreateBoardInlineClick = () => {
        setIsCreatingInline(true);
    };

    const handleNewBoardTitleChange = (event) => {
        setNewBoardTitle(event.target.value);
    };

    const handleNewBoardDescriptionChange = (event) => {
        setNewBoardDescription(event.target.value);
    };

    const handleCreateNewBoardInline = async () => {
        if (newBoardTitle.trim()) {
            try {
                const newBoardRef = await addDoc(boardsCollectionRef, {
                    title: newBoardTitle.trim(),
                    color: newBoardColor,
                    description: newBoardDescription.trim(), // Optional description
                    createdOn: new Date().toLocaleDateString(), // Set createdOn timestamp
                    createdAt: new Date(), // Firestore timestamp (optional, but good to keep)
                    tintColor: null, // Initial tint color
                });

                // Initialize default lists for the new board
                const boardId = newBoardRef.id;
                const defaultLists = [
                    { title: 'To Do', order: 0 },
                    { title: 'In Progress', order: 1 },
                    { title: 'Done', order: 2 },
                ];

                for (const [index, list] of defaultLists.entries()) {
                    const newListRef = await addDoc(listsCollectionRef, {
                        boardId: boardId,
                        title: list.title,
                        order: index,
                        createdAt: new Date(),
                    });

                    // Initialize default cards for the 'To Do' list
                    if (list.title === 'To Do') {
                        const todoListId = newListRef.id;
                        const defaultCards = [
                            { text: 'Add your first task', order: 0 },
                            { text: 'Explore the board features', order: 1 },
                        ];
                        for (const [cardIndex, card] of defaultCards.entries()) {
                            await addDoc(cardsCollectionRef, {
                                listId: todoListId,
                                text: card.text,
                                order: cardIndex,
                                createdAt: new Date(),
                            });
                        }
                    }
                }

                setIsCreatingInline(false);
                setNewBoardTitle('');
                setNewBoardDescription('');
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Failed to create new board.');
            }
        } else {
            alert('Board name cannot be empty.'); // Make it compulsory
        }
    };

    const handleEditBoard = (boardId, title, description) => {
        setEditingBoardId(boardId);
        setEditText(title);
        setEditDescription(description);
    };

    const handleSaveEdit = async (boardId) => {
        if (editText.trim()) {
            try {
                const boardDocRef = doc(db, 'boards', boardId);
                await updateDoc(boardDocRef, {
                    title: editText.trim(),
                    description: editDescription.trim(),
                    // Removed update to createdOn
                });
                setEditingBoardId(null);
            } catch (error) {
                console.error("Error updating document: ", error);
                alert('Failed to update board.');
            }
        } else {
            alert('Board title cannot be empty.');
        }
    };

    const handleCancelEdit = () => {
        setEditingBoardId(null);
    };

    const handleEditTextChange = (event) => {
        setEditText(event.target.value);
    };

    const handleEditDescriptionChange = (event) => {
        setEditDescription(event.target.value);
    };

    const handleKeyDown = (event, boardId) => {
        if (event.key === 'Enter') {
            handleSaveEdit(boardId);
        }
    };

    const handleDeleteBoard = async (boardId) => {
        try {
            const boardDocRef = doc(db, 'boards', boardId);
            await deleteDoc(boardDocRef);
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert('Failed to delete board.');
        }
    };

    const handleOpenColorPicker = (boardId, color) => {
        setChangingColorBoardId(boardId);
        setCurrentColor(color);
    };

    const handleCloseColorPicker = () => {
        setChangingColorBoardId(null);
    };

    const handleBoardColorChange = (color) => {
        setCurrentColor(color.hex);
    };

    const handleSaveBoardColor = async (boardId) => {
        try {
            const boardDocRef = doc(db, 'boards', boardId);
            await updateDoc(boardDocRef, {
                color: currentColor,
                // Removed update to createdOn
            });
            handleCloseColorPicker();
        } catch (error) {
            console.error("Error updating board color: ", error);
            alert('Failed to update board color.');
        }
    };

    const handleOpenTintColorPicker = (boardId, tint) => {
        setChangingTintColorBoardId(boardId);
        setCurrentTintColor(tint || '#fff'); // Default to white if no tint
    };

    const handleCloseTintColorPicker = () => {
        setChangingTintColorBoardId(null);
    };

    const handleTintColorChange = (color) => {
        setCurrentTintColor(color.hex);
    };

    const handleSaveTintColor = async () => {
        if (changingTintColorBoardId) {
            try {
                const boardDocRef = doc(db, 'boards', changingTintColorBoardId);
                await updateDoc(boardDocRef, {
                    tintColor: currentTintColor,
                    // Removed update to createdOn
                });
                handleCloseTintColorPicker();
            } catch (error) {
                console.error("Error updating tint color: ", error);
                alert('Failed to update tint color.');
            }
        }
    };

    const getShadowColor = (baseColor) => {
        if (!baseColor) {
            return 'rgba(0,0,0,0.3)'; // Default shadow color
        }
        const rgbaValues = baseColor.substring(baseColor.indexOf('(') + 1, baseColor.lastIndexOf(')')).split(',');
        let shadowDarkness = 50; // Adjust for shadow intensity
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
                return `rgba(${Math.max(0, r - shadowDarkness)}, ${Math.max(0, g - shadowDarkness)}, ${Math.max(0, b - shadowDarkness)}, 0.3)`; // Assuming opacity of 0.3
            };
            return hexToRgb(baseColor);
        }
        return 'rgba(0,0,0,0.3)'; // Fallback
    };

    const tintAmount = 0.2; // Adjust this value (0.0 to 1.0) to control the tint intensity

    const getTintedBackgroundColor = (baseColor, tint) => {
        if (tint) {
            const r = parseInt(tint.slice(1, 3), 16);
            const g = parseInt(tint.slice(3, 5), 16);
            const b = parseInt(tint.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${tintAmount})`;
        }
        return baseColor;
    };

    const formatTime = (timestamp) => {
        if (!timestamp || !timestamp.toDate) {
            return '';
        }
        const date = timestamp.toDate();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${formattedMinutes} ${ampm}`;
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaTh size={20} className="mr-2" /> Your Boards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.isArray(boards) && boards.map((board) => (
                    <div
                        key={board.id}
                        className="relative bg-white rounded-md shadow-md hover:shadow-lg transition duration-300 p-4 block"
                        style={{ backgroundColor: getTintedBackgroundColor(board.color, board.tintColor), boxShadow: `0 2px 5px ${getShadowColor(board.tintColor || board.color)}` }}
                        onMouseEnter={() => setShowActions(board.id)}
                        onMouseLeave={() => setShowActions(null)}
                    >
                        {editingBoardId === board.id ? (
                            <div className="flex flex-col">
                                <input
                                    ref={editTitleRef}
                                    type="text"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                                    value={editText}
                                    onChange={handleEditTextChange}
                                    onKeyDown={(e) => handleKeyDown(e, board.id)}
                                />
                                <textarea
                                    ref={editDescriptionRef}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                                    value={editDescription}
                                    onChange={handleEditDescriptionChange}
                                    onKeyDown={(e) => handleKeyDown(e, board.id)}
                                    placeholder="Enter board description"
                                />
                                <div className="flex justify-end">
                                    <button onClick={() => handleSaveEdit(board.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-sm mr-1">Save</button>
                                    <button onClick={handleCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-2 rounded text-sm">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to={{
                                    pathname: `/board/${board.id}`,
                                    state: { boardTitle: board.title } // Pass the title in the state
                                }} className="block">
                                    <h3
                                        className="font-bold"
                                        style={{
                                            whiteSpace: 'normal',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-all',
                                        }}
                                    >
                                        {board.title}
                                    </h3>
                                    {board.description && (
                                        <p
                                            className="text-gray-600 text-sm mt-1"
                                            style={{
                                                whiteSpace: 'normal',
                                                overflowWrap: 'break-word',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {board.description}
                                        </p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                        Created on: {board.createdOn} at {board.createdAt && formatTime(board.createdAt)}
                                    </p>
                                </Link>
                                <div className="absolute top-2 right-2" style={{ visibility: showActions === board.id ? 'visible' : 'hidden' }}>
                                    <button onClick={() => handleOpenTintColorPicker(board.id, board.tintColor)} className="text-gray-500 hover:text-gray-700 mr-2">
                                        <FaPalette size={16} />
                                    </button>
                                    <button onClick={() => handleEditBoard(board.id, board.title, board.description)} className="text-gray-500 hover:text-gray-700 mr-2">
                                        <FaPencilAlt size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteBoard(board.id)} className="text-gray-500 hover:text-gray-700">
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                        {changingTintColorBoardId === board.id && (
                            <div className="absolute top-10 left-0 bg-white shadow-md rounded-md p-4 z-50"> {/* Added z-50 */}
                                <CirclePicker color={currentTintColor} onChange={handleTintColorChange} />
                                <div className="flex justify-end mt-2">
                                    <button onClick={handleCloseTintColorPicker} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-2 rounded text-sm mr-1">Cancel</button>
                                    <button onClick={handleSaveTintColor} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded text-sm">Save</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {!isCreatingInline && (
                    <div
                        onClick={handleCreateBoardInlineClick}
                        className="bg-white rounded-md shadow-md p-4 flex items-center justify-center h-32 cursor-pointer hover:bg-gray-100 transition duration-300 border-2 border-dashed border-gray-300"
                    >
                        <FaPlus size={24} className="text-gray-500" />
                        <span className="ml-2 text-gray-500 font-semibold">Add New Board</span>
                    </div>
                )}
                {isCreatingInline && (
                    <div className="bg-white rounded-md shadow-md p-4 flex flex-col h-auto"> {/* Adjusted height */}
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                            placeholder="Enter board title"
                            value={newBoardTitle}
                            onChange={handleNewBoardTitleChange}
                        />
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                            placeholder="Enter board description (optional)"
                            value={newBoardDescription}
                            onChange={handleNewBoardDescriptionChange}
                        />
                        <button onClick={handleCreateNewBoardInline} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm">
                            Create
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default memo(BoardList);