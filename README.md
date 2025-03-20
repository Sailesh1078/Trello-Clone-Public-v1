# Trello Clone using React and Firebase

## Overview

This project is a simplified clone of Trello, a popular project management tool. It allows users to create boards, organize tasks into lists, and manage individual tasks as cards. The application utilizes React for the frontend and Firebase for the backend, providing real-time data synchronization.


## Tech Stack

* **Frontend:** React
* **Routing:** React Router
* **Styling:** Tailwind CSS
* **State Management:** React Context API
* **Drag and Drop:** DnD-kit 
* **Backend:** Firebase
    * Firestore Database

## Features

This application implements the following features:

* **Board Management:**
    * Create Boards: Users can create new project boards.
    * Display Boards: A list of all created boards is shown to the user.
    * Board View: Clicking on a board navigates the user to a detailed view of that specific board.
* **Lists and Cards:**
    * Create Lists: Users can add new lists to organize tasks within a board.
    * Create Cards: Users can add individual task cards within each list.
    * Edit Lists: Users can modify the titles of existing lists.
    * Delete Lists: Users can remove lists from a board.
    * Edit Cards: Users can modify the content of existing cards.
    * Delete Cards: Users can remove cards from a list.
* **Drag and Drop:**
    * Move Cards Between Lists: Users can drag and drop cards from one list to another to change their status or category.
    * Reorder Cards Within a List: Users can drag and drop cards within the same list to change their priority or order.
* **Responsive UI:**
    * The application layout adapts to different screen sizes, providing a consistent experience on desktops, tablets, and mobile devices.

## Installation

Follow these steps to run the application locally:

### Prerequisites

* **Node.js** (version 18 or higher recommended): You can download it from [https://nodejs.org/](https://nodejs.org/).
* **npm** (usually comes with Node.js) or **yarn**: You can install yarn using `npm install --global yarn`.
* **Firebase Account:** You will need a Firebase project to configure the backend. Create one at [https://console.firebase.google.com/](https://console.firebase.google.com/)., (Currently I have created one for demonstration purposes, so you can ignore this step.)

### Cloning the Repository

1.  Open your terminal or command prompt.
2.  Navigate to the directory where you want to clone the project.
3.  Run the following command:

    ```bash
    git clone [https://github.com/Sailesh1078/Trello-Clone-Public-v1](https://github.com/Sailesh1078/Trello-Clone-Public-v1)
    ```

### Installing Dependencies

1.  Navigate to the project directory in your terminal:

    ```bash
    cd Trello-Clone-Public-v1
    ```

2.  Install the required dependencies using npm or yarn:

    **Using npm:**

    ```bash
    npm install
    ```

    **Using yarn:**

    ```bash
    yarn install
    ```

### Setting up Firebase Credentials(Although I have hardcoded these credentials for demonstration, please refrain for using those credentials. I have detailed the steps, so you could host the website using your database.)

1.  Go to your Firebase project console.
2.  Click on the "Project settings" (gear icon next to "Project Overview").
3.  Navigate to the "General" tab and scroll down to the "Your apps" section.
4.  If you haven't already, register a web app by clicking the "</>" icon.
5.  Follow the steps to register your app. Once done, you will see your Firebase configuration object.
6.  Create a file named `.env.local` in the root of your project.
7.  Copy the Firebase configuration object into your `.env.local` file and assign each value to an environment variable with the prefix `REACT_APP_`. For example:

    ```dotenv
    REACT_APP_API_KEY="YOUR_API_KEY"
    REACT_APP_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    REACT_APP_PROJECT_ID="YOUR_PROJECT_ID"
    REACT_APP_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    REACT_APP_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    REACT_APP_APP_ID="YOUR_APP_ID"
    ```

    **Important:** Do not commit your `.env.local` file to your version control system as it contains sensitive information.

### Running the Application

1.  In your terminal, within the project directory, start the Vite development server using npm or yarn:

    **Using npm:**

    ```bash
    npm run dev
    ```

    **Using yarn:**

    ```bash
    yarn dev
    ```

2.  Vite will start the development server, and you should see output in your terminal indicating the server is running. Typically, Vite applications run on **`http://localhost:5173`**. Open your web browser and navigate to this address to view the application.

## Learning Outcomes

By working on this assignment, I have gained practical experience and a deeper understanding of the following concepts and technologies:

* **React Fundamentals:** I learned how to structure a React application using components, props, state, and hooks (like `useState`, `useEffect`, and `useContext`).
* **React Router:** I implemented navigation between different views (board list and individual board view) using React Router.
* **Firebase Firestore:** I used Firestore as the NoSQL database to store and retrieve application data, including boards, lists, and cards. I learned how to structure data, perform CRUD operations, and utilize real-time updates with Firestore listeners (`onSnapshot`).
* **State Management (React Context API):** I utilized the React Context API to manage application-wide state, such as board titles, making data accessible across different components without prop drilling.
* **Drag and Drop Implementation (DnD-kit):** I implemented drag and drop functionality using the DnD-kit library to allow users to move cards between lists and reorder them within lists, understanding the concepts of draggable and droppable elements and handling drag events.
* **UI Framework (Tailwind CSS):** I used Tailwind CSS to rapidly style the application with a utility-first CSS approach, learning how to apply pre-defined classes to create a responsive and visually appealing user interface.
* **Responsive Design:** I focused on creating a layout that adapts to various screen sizes using Tailwind CSS's responsive utilities, ensuring a good user experience on different devices.
* **Asynchronous Operations:** I gained experience in handling asynchronous operations, especially when interacting with Firebase for database operations, using `async/await` to manage promises.
* **Data Modeling:** I thought about how to structure the data in Firestore to efficiently represent boards, lists, and cards and to support the required functionalities.

## Future Enhancements (Optional)

Here are some potential future enhancements for this application:

* Real-time collaboration: Allow multiple users to work on the same board simultaneously.
* Card details: Implement a modal or page to view and edit detailed information for each card (e.g., description, due date, assignees).
* List reordering: Allow users to drag and drop lists to change their order on the board.
* Color coding for cards or lists.
* Search functionality to find specific cards or boards.
