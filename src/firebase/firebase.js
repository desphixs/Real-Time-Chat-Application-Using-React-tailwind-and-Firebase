import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCcm4XROPZdWHcnVwFqldvwAWdRyuka5q0",
    authDomain: "real-time-chat-ef747.firebaseapp.com",
    projectId: "real-time-chat-ef747",
    storageBucket: "real-time-chat-ef747.firebasestorage.app",
    // storageBucket: "real-time-chat-ef747.appspot.com", // Fixed here
    messagingSenderId: "731524034555",
    appId: "1:731524034555:web:936e5299621f14ac9b655e",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export { auth };
