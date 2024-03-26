// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "yusuf-estate-842d3.firebaseapp.com",
  projectId: "yusuf-estate-842d3",
  storageBucket: "yusuf-estate-842d3.appspot.com",
  messagingSenderId: "576289661826",
  appId: "1:576289661826:web:7427ea407c8e46125da59b"
};

// Initialize Firebase
export  const app = initializeApp(firebaseConfig);