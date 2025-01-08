import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCcm4XROPZdWHcnVwFqldvwAWdRyuka5q0",
    authDomain: "real-time-chat-ef747.firebaseapp.com",
    projectId: "real-time-chat-ef747",
    storageBucket: "real-time-chat-ef747.appspot.com", // Corrected storageBucket
    messagingSenderId: "731524034555",
    appId: "1:731524034555:web:936e5299621f14ac9b655e",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

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

// Function to listen for messages
export const listenForMessages = (chatId, setMessages) => {
    const chatRef = collection(db, "chats", chatId, "messages");
    onSnapshot(chatRef, (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data());
        setMessages(messages);
    });
};

export const listenForChats = (setChats) => {
    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
        const chatList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Filter chats to only include those where the current user is a participant
        const filteredChats = chatList.filter((chat) => chat.users.some((user) => user.email === auth.currentUser.email));

        setChats(filteredChats); // Update state with filtered chats
    });

    return unsubscribe; // Return the unsubscribe function for cleanup
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
