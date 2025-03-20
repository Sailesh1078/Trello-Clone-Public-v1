// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdghNRcDhNISj6G0XM4w7MP3Lu40M58uY",
  authDomain: "publictrelloclone.firebaseapp.com",
  projectId: "publictrelloclone",
  storageBucket: "publictrelloclone.firebasestorage.app",
  messagingSenderId: "972288363295",
  appId: "1:972288363295:web:a9e670fce22c4e7de6be2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export the Firestore instance