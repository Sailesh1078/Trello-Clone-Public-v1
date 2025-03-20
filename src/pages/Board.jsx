// src/pages/Board.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import List from '../components/List';
import { DarkModeContext } from '../context/DarkModeContext';
import { useParams, useLocation } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { BoardTitleContext } from '../context/BoardTitleContext'; // Import BoardTitleContext

const GENERIC_BOILERPLATE_DATA = [
    {
        title: "To Do",
        cards: ["Task 1 for To Do", "Task 2 for To Do"],
    },
    {
        title: "In Progress",
        cards:[],
    },
    {
        title: "Doing",
        cards:[],
    },
];

function Board() {
    const { boardId } = useParams();
    const { state } = useLocation();
    const initialBoardTitle = state?.boardTitle;
    const { isDarkMode } = useContext(DarkModeContext);
    const { setBoardTitle } = useContext(BoardTitleContext); // Get setBoardTitle from context
    const [boardData, setBoardData] = useState(null);
    const [lists, setLists] = useState(); // Initialize as empty array
    const [loadingLists, setLoadingLists] = useState(true); // Add a loading state
    const [isAddingNewList, setIsAddingNewList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const dragListId = useRef(null);
    const hasBoilerplateAdded = useRef(false);

    const addBoilerplateListsAndCards = async (boardId) => {
        if (hasBoilerplateAdded.current) {
            return; // Prevent adding boilerplate multiple times
        }
        try {
            for (let i = 0; i < GENERIC_BOILERPLATE_DATA.length; i++) {
                const listData = GENERIC_BOILERPLATE_DATA[i];
                const listsCollectionRef = collection(db, 'boards', boardId, 'lists'); // Updated to subcollection
                const newListRef = await addDoc(listsCollectionRef, {
                    title: listData.title,
                    order: i, // Initial order of lists
                });

                // Add cards to the newly created list
                const cardsCollectionRef = collection(db, 'boards', boardId, 'lists', newListRef.id, 'cards'); // Updated to subcollection
                for (let j = 0; j < listData.cards.length; j++) {
                    await addDoc(cardsCollectionRef, {
                        text: listData.cards[j],
                        order: j, // Initial order of cards within the list
                    });
                }
            }
            hasBoilerplateAdded.current = true;
            console.log("Boilerplate lists and cards added successfully.");
        } catch (error) {
            console.error("Error adding boilerplate data:", error);
        }
    };

    useEffect(() => {
        if (initialBoardTitle) {
            setBoardTitle(initialBoardTitle); // Set initial title in context
        }

        const fetchBoardData = async () => {
            try {
                const boardDocumentRef = doc(db, 'boards', boardId);
                const docSnap = await getDoc(boardDocumentRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBoardData(data);
                    if (data.title) {
                        setBoardTitle(data.title); // Update title in context with fetched title
                    }
                } else {
                    console.log("No such document!");
                    setBoardTitle('Board Not Found');
                }
            } catch (error) {
                console.error("Error fetching board data:", error);
                setBoardTitle('Error Loading Board');
            }
        };

        fetchBoardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId, initialBoardTitle, setBoardTitle]); // Removed boardData from dependency array

    useEffect(() => {
        setLoadingLists(true);
        let unsubscribeLists = () => {};
        let unsubscribeCards =[];

        const fetchListsWithCardListeners = async () => {
            try {
                const listsCollectionRef = collection(db, 'boards', boardId, 'lists');
                const listsQuery = query(listsCollectionRef, orderBy('order', 'asc'));

                unsubscribeLists = onSnapshot(listsQuery, (listsSnapshot) => {
                    const fetchedLists =[];
                    unsubscribeCards.forEach(unsub => unsub()); // Unsubscribe from previous card listeners
                    unsubscribeCards =[];

                    listsSnapshot.forEach((listDoc) => {
                        const listData = { id: listDoc.id, ...listDoc.data(), cards:[]};
                        const cardsCollectionRef = collection(db, 'boards', boardId, 'lists', listDoc.id, 'cards');
                        const cardsQuery = query(cardsCollectionRef, orderBy('order', 'asc'));

                        const unsubscribe = onSnapshot(cardsQuery, (cardsSnapshot) => {
                            listData.cards =[];
                            cardsSnapshot.forEach((cardDoc) => {
                                listData.cards.push({ id: cardDoc.id, ...cardDoc.data() });
                            });
                            // Update the fetchedLists array
                            const index = fetchedLists.findIndex(list => list.id === listData.id);
                            if (index !== -1) {
                                fetchedLists[index] = listData;
                            } else {
                                fetchedLists.push(listData);
                            }
                            // After processing all lists, set the state
                            if (fetchedLists.length === listsSnapshot.size) {
                                const orderedFetchedLists = listsSnapshot.docs
                                    .map(doc => fetchedLists.find(list => list.id === doc.id))
                                    .filter(Boolean);
                                setLists(orderedFetchedLists);
                                setLoadingLists(false);
                            }
                        }, (error) => console.error("Error fetching cards:", error));
                        unsubscribeCards.push(unsubscribe);
                        fetchedLists.push(listData);
                    });

                    if (listsSnapshot.empty && boardData && !hasBoilerplateAdded.current) {
                        addBoilerplateListsAndCards(boardId);
                    }
                }, (error) => {
                    console.error("Error fetching lists:", error);
                    setLoadingLists(false);
                });
            } catch (error) {
                console.error("Error setting up snapshot listeners:", error);
                setLoadingLists(false);
            }
        };

        fetchListsWithCardListeners();

        return () => {
            unsubscribeLists();
            unsubscribeCards.forEach(unsub => unsub());
        };
    }, [boardId, boardData]);

    const getDocsFromQuery = async (querySnapshot) => {
        try {
            const snapshot = await getDocs(querySnapshot); // Execute the query to get the snapshot
            const docs =[];
            snapshot.forEach((doc) => {
                docs.push(doc);
            });
            return docs;
        } catch (error) {
            console.error("Error getting documents from query:", error);
            return; // Return an empty array in case of an error
        }
    };

    const onDragOver = (event) => {
        event.preventDefault();
    };

    const onDrop = async (event, targetListId) => {
        const cardId = event.dataTransfer.getData('cardId');
        const sourceListId = event.dataTransfer.getData('sourceListId');

        if (cardId && sourceListId && targetListId) {
            if (sourceListId === targetListId) {
                // Handle reordering within the same list (if needed, your current logic might handle this)
                return;
            }

            const cardToMove = lists
                .find((list) => list.id === sourceListId)?.cards
                .find((card) => card.id === cardId);

            if (cardToMove) {
                // 1. Remove the card from the source list in the database
                const sourceCardRef = doc(db, 'boards', boardId, 'lists', sourceListId, 'cards', cardId);
                try {
                    await deleteDoc(sourceCardRef);
                    console.log(`Card ${cardId} removed from list ${sourceListId}`);
                } catch (error) {
                    console.error("Error removing card from source list:", error);
                    return;
                }

                // 2. Add the card to the target list in the database
                const targetCardsCollectionRef = collection(db, 'boards', boardId, 'lists', targetListId, 'cards');
                try {
                    await addDoc(targetCardsCollectionRef, {
                        ...cardToMove, // Keep existing card data
                        listId: targetListId, // Update the listId if you have it in your card data
                        // order will be handled by the onSnapshot listener, but you might want to set an initial order
                        order: lists.find(list => list.id === targetListId)?.cards.length || 0,
                    });
                    console.log(`Card ${cardId} added to list ${targetListId}`);
                } catch (error) {
                    console.error("Error adding card to target list:", error);
                    // Potentially re-add to the source list if this fails for better UX
                }
            }
        }
    };

    const onDragStartList = (listId) => {
        dragListId.current = listId;
    };

    const onDropList = (event) => {
        const droppedListId = event.dataTransfer.getData('listId');
        if (droppedListId && droppedListId !== dragListId.current) {
            const draggedListIndex = lists.findIndex(list => list.id === dragListId.current);
            const droppedOverListIndex = lists.findIndex(list => event.currentTarget.dataset.listid === list.id.toString());

            if (draggedListIndex !== -1 && droppedOverListIndex !== -1) {
                const newLists = [...lists];
                const [draggedList] = newLists.splice(draggedListIndex, 1);
                newLists.splice(droppedOverListIndex, 0, draggedList);
                setLists(newLists);

                // Update the order of the lists in Firebase
                newLists.forEach(async (list, index) => {
                    const listRef = doc(db, 'boards', boardId, 'lists', list.id);
                    try {
                        await updateDoc(listRef, { order: index });
                    } catch (error) {
                        console.error("Error updating list order:", error);
                    }
                });
            }
        }
        dragListId.current = null;
    };

    const addCardToList = async (listId, newCardText) => {
        if (newCardText.trim()) {
            const cardsCollectionRef = collection(db, 'boards', boardId, 'lists', listId, 'cards');
            await addDoc(cardsCollectionRef, {
                text: newCardText,
                order: (lists.find(list => list.id === listId)?.cards.length || 0), // Basic ordering
            });
            // No need to update local state (setLists) as the onSnapshot listener will handle it.
        }
    };

    const updateCardText = async (cardId, newText) => {
        const list = lists.find(list => list.cards.some(card => card.id === cardId));
        if (list) {
            const cardRef = doc(db, 'boards', boardId, 'lists', list.id, 'cards', cardId);
            await updateDoc(cardRef, { text: newText });
            // No need to update local state.
        }
    };

    const deleteCard = async (cardId) => {
        const list = lists.find(list => list.cards.some(card => card.id === cardId));
        if (list) {
            const cardRef = doc(db, 'boards', boardId, 'lists', list.id, 'cards', cardId);
            await deleteDoc(cardRef);
            // No need to update local state.
        }
    };

    const updateListTitle = async (listId, newTitle) => {
        const listRef = doc(db, 'boards', boardId, 'lists', listId);
        await updateDoc(listRef, { title: newTitle });
        // No need to update local state.
    };

    const deleteList = async (listId) => {
        const listRef = doc(db, 'boards', boardId, 'lists', listId);
        await deleteDoc(listRef);
        // No need to update local state.
    };

    const handleAddListClick = () => {
        setIsAddingNewList(true);
    };

    const handleNewListNameChange = (event) => {
        setNewListName(event.target.value);
    };

    const handleSaveNewList = () => {
        if (newListName.trim()) {
            const newListData = {
                title: newListName,
                order: lists.length, // You might need a better way to determine the order
            };
            const listsCollectionRef = collection(db, 'boards', boardId, 'lists');
            addDoc(listsCollectionRef, newListData).then(() => {
                setNewListName('');
                setIsAddingNewList(false);
            });
        }
    };

    const handleCancelAddList = () => {
        setIsAddingNewList(false);
        setNewListName('');
    };

    const handleNewListKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSaveNewList();
        }
    };

    return (
        <div className="h-full p-4" onDragOver={onDragOver}>
            <div className="pt-16">
                <div className="flex space-x-4">
                    {loadingLists ? (
                        <div>Loading lists...</div> // You can add a more sophisticated loader here
                    ) : (
                        lists.map((list, index) => (
                            <div
                                key={list.id}
                                data-listid={list.id}
                                onDrop={onDropList}
                                onDragOver={(event) => event.preventDefault()}
                            >
                                <List
                                    list={list}
                                    onDrop={onDrop}
                                    onAddCard={addCardToList}
                                    onUpdateCard={updateCardText}
                                    onDeleteCard={deleteCard}
                                    onUpdateListTitle={updateListTitle}
                                    onDeleteList={deleteList}
                                    onDragStartList={onDragStartList}
                                    listTintColor={list.tintColor}
                                    onUpdateLists={setLists}
                                />
                            </div>
                        ))
                    )}
                    {isAddingNewList ? (
                        <div className={`rounded-md p-2 flex-shrink-0 w-64 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}>
                            <input
                                type="text"
                                className={`w-full rounded-md border p-2 mb-2 ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : ''}`}
                                placeholder="Enter list title..."
                                value={newListName}
                                onChange={handleNewListNameChange}
                                onKeyDown={handleNewListKeyDown}
                            />
                            <div className="flex">
                                <button
                                    className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                                    onClick={handleSaveNewList}
                                >
                                    Add List
                                </button>
                                <button
                                    className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'}`}
                                    onClick={handleCancelAddList}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-shrink-0 w-32 flex flex-col items-center justify-center rounded hover:bg-gray-100 cursor-pointer p-2">
                            <button
                                onClick={handleAddListClick}
                                className="focus:outline-none"
                            >
                                <svg height="36px" width="36px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 125.167 125.167" xmlSpace="preserve" fill={isDarkMode ? '#d1d5db' : '#718096'}>
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <g>
                                            <path style={{ fill: isDarkMode ? '#d1d5db' : '#718096' }} d="M0.003,0v125.167h81.686l43.475-43.469V0.012H0.003V0z M67.303,87.2h-9.44V67.306H37.97v-9.446 h19.894V37.967h9.44v19.894h19.894v9.446H67.303V87.2z M80.484,122.255V80.487h41.768L80.484,122.255z"></path>
                                        </g>
                                    </g>
                                </svg>
                            </button>
                            <span className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Add another list</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Board;