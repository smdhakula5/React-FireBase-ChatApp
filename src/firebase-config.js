
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBkHxGnYHHwxYDqT2s6uUQCL6JZaiu4oTQ",
  authDomain: "chat-app-20cf6.firebaseapp.com",
  projectId: "chat-app-20cf6",
  storageBucket: "chat-app-20cf6.appspot.com",
  messagingSenderId: "50755916269",
  appId: "1:50755916269:web:513b16a4e539a32f8a17e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);