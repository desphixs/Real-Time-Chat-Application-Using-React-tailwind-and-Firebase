import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const listenForChats = (setChats) => {
    // Function to listen for real-time chat updates from Firestore
    // `setChats` is a function that updates the state with the latest chat data

    const chatsRef = collection(db, "chats");
    // Reference to the "chats" collection in Firestore, where chat messages are stored

    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
        // `onSnapshot` listens for changes in the "chats" collection in real-time
        // Whenever there is an update (new message, edit, delete), this function runs

        const chatList = snapshot.docs.map((doc) => ({
            // Convert Firestore documents into an array of chat objects
            id: doc.id, // Get the document ID (unique identifier for each chat)
            ...doc.data(), // Spread the remaining chat data (messages, users, etc.)
        }));

        // Filter chats to only include those where the current user is a participant
        const filteredChats = chatList.filter(
            (chat) => chat.users.some((user) => user.email === auth.currentUser.email)
            // Check if the current user's email exists in the "users" array of the chat
        );

        setChats(filteredChats); // Update state with only the relevant chats for the user
    });

    return unsubscribe;
    // Return the unsubscribe function so the listener can be stopped when no longer needed
};

// Function to listen for messages in a specific chat
export const listenForMessages = (chatId, setMessages) => {
    // Reference to the "messages" collection inside a specific chat
    // The path follows this structure: "chats/{chatId}/messages"
    const chatRef = collection(db, "chats", chatId, "messages");

    // Listen for real-time updates in the "messages" collection
    onSnapshot(chatRef, (snapshot) => {
        // Convert the list of document snapshots into an array of message objects
        const messages = snapshot.docs.map((doc) => doc.data());

        // Update the state with the new list of messages
        setMessages(messages);
    });
};

export const sendMessage = async (messageText, chatId, user1, user2) => {
    const chatRef = doc(db, "chats", chatId);

    // Fetch full user objects
    const user1Doc = await getDoc(doc(db, "users", user1)); // Assuming you store users in a "users" collection
    const user2Doc = await getDoc(doc(db, "users", user2));

    console.log(user1Doc);
    console.log(user2Doc);

    if (!user1Doc.exists() || !user2Doc.exists()) {
        console.error("User documents not found");
        return;
    }

    const user1Data = user1Doc.data();
    const user2Data = user2Doc.data();

    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
        // Create the chat with full user objects
        await setDoc(chatRef, {
            users: [user1Data, user2Data], // Store full user objects
            lastMessage: messageText,
            lastMessageTimestamp: serverTimestamp(),
        });
    } else {
        // Update the chat with the last message
        await updateDoc(chatRef, {
            lastMessage: messageText,
            lastMessageTimestamp: serverTimestamp(),
        });
    }

    const messageRef = collection(db, "chats", chatId, "messages");
    await addDoc(messageRef, {
        text: messageText,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp(),
    });
};

// Monitor authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // When user signs in, set their status to online
        await setDoc(
            doc(db, "users", user.uid),
            {
                status: "online",
                lastSeen: serverTimestamp(),
            },
            { merge: true }
        );
    } else if (auth.currentUser) {
        // When user signs out, set their status to offline
        await setDoc(
            doc(db, "users", auth.currentUser.uid),
            {
                status: "offline",
                lastSeen: serverTimestamp(),
            },
            { merge: true }
        );
    }
});

// Export initialized Firebase services
export { auth, db };
