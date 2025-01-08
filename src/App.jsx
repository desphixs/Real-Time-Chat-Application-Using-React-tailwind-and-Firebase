import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db, sendMessage, listenForMessages, listenForChats } from "./firebase/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { use } from "react";

function Chat({ chatId, user1, user2 }) {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        listenForMessages(chatId, setMessages);
    }, [chatId]);

    const handleSendMessage = () => {
        if (messageText.trim()) {
            sendMessage(messageText, chatId, user1?.uid, user2?.uid);
            setMessageText("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-auto">
                {messages
                    .slice() // Create a copy of the messages array to avoid mutating the original
                    .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp (ascending)
                    .map((message, index) => (
                        <div key={index} className="p-4">
                            <strong>{message.sender}</strong>: {message.text}
                        </div>
                    ))}
            </div>
            <div className="flex p-4">
                <input type="text" placeholder="Type your message" className="flex-1 px-4 py-2 border rounded" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                <button className="bg-blue-500 text-white px-4 py-2 ml-2 rounded" onClick={handleSendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}

function App() {
    const [userData, setUserdata] = useState({ fullName: "", email: "", password: "" });
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [userLastSeen, setUserLastSeen] = useState(null);
    const [chats, setChats] = useState([]);

    const handleChangeUserData = (e) => {
        const { name, value } = e.target;
        setUserdata((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAuth = async () => {
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, userData?.email, userData?.password);
                alert("Logged in successfully!");
            } else {
                // Create a new user in Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, userData?.email, userData?.password);

                // Get the user information
                const user = userCredential.user;

                // Add the new user to the Firestore "users" collection
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    uid: user.uid,
                    email: user.email,
                    username: user.email.split("@")[0], // Extract username from email
                    fullName: userData?.fullName, // Optional: Replace with an input for full name
                });

                alert("Account created successfully and user added to Firestore!");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            alert("Please enter a search term.");
            return;
        }

        try {
            // Normalize the search term
            const normalizedSearchTerm = searchTerm.toLowerCase();

            // Query Firestore for matching usernames
            const q = query(collection(db, "users"), where("username", ">=", normalizedSearchTerm), where("username", "<=", normalizedSearchTerm + "\uf8ff"));

            const querySnapshot = await getDocs(q);

            // Collect matching users
            const foundUsers = [];
            querySnapshot.forEach((doc) => {
                foundUsers.push(doc.data());
            });

            // Update state with results
            setUsers(foundUsers);

            if (foundUsers.length === 0) {
                alert("No users found.");
            }
        } catch (error) {
            console.error("Error searching for users:", error);
        }
    };

    const logAllUsers = async () => {
        try {
            // Reference the "users" collection
            const usersCollection = collection(db, "users");

            // Fetch all documents in the collection
            const querySnapshot = await getDocs(usersCollection);

            // Loop through the results and log each user's data
            querySnapshot.forEach((doc) => {
                // console.log("User ID:", doc.id, "User Data:", doc.data());
            });
        } catch (error) {
            console.error("Error fetching users:", error.message);
        }
    };

    const startChat = (user) => {
        setSelectedUser(user);
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return "Unknown"; // In case timestamp is not available

        const currentTime = Date.now() / 1000; // Get current time in seconds
        const timeDiff = currentTime - timestamp; // Difference in seconds

        const minutes = Math.floor(timeDiff / 60); // Convert seconds to minutes
        const hours = Math.floor(timeDiff / 3600); // Convert seconds to hours
        const days = Math.floor(timeDiff / 86400); // Convert seconds to days

        if (days > 0) {
            return `${days} day${days > 1 ? "s" : ""} ago`; // e.g., 1 day ago, 2 days ago
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`; // e.g., 1 hour ago, 2 hours ago
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`; // e.g., 1 minute ago, 5 minutes ago
        } else {
            return "Just now"; // If the user was seen recently (less than a minute ago)
        }
    };

    useEffect(() => {
        // Check for the currently logged-in user
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }

        // Listen to changes in the user's auth state
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        // Clean up the listener
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Fetch user status from Firestore
        const fetchUserStatus = async (userId) => {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                setUserStatus(userDoc.data().status);
                setUserLastSeen(userDoc.data().lastSeen);
            }
        };

        // Assuming you have the selected user object with `uid`
        if (selectedUser) {
            fetchUserStatus(selectedUser.uid);
        }
    }, [selectedUser]);

    // useEffect(() => {
    //     const fetchChats = async () => {
    //         const q = query(collection(db, "chats"));
    //         const querySnapshot = await getDocs(q);
    //         const chatList = querySnapshot.docs.map((doc) => ({
    //             id: doc.id,
    //             ...doc.data(),
    //         }));

    //         const filteredChats = chatList.filter((chat) => chat.users.some((user) => user.email === auth.currentUser.email));

    //         console.log("Filtered chats:", filteredChats);
    //         setChats(filteredChats);
    //     };

    //     fetchChats();
    // }, []);

    useEffect(() => {
        const unsubscribe = listenForChats(setChats);

        // Cleanup the listener on component unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div>
            <div>
                {user ? (
                    <>
                        <h1 className="">Welcome, {user.email}!</h1>
                        <p>Your UID: {user.uid}</p>
                        <button onClick={handleLogout}>Logout</button>

                        <hr />
                        <div>
                            <h4>All Chats</h4>
                            {chats.length > 0 ? (
                                // chats.map((chat) => (
                                //     <div key={chat.id} className="chat-item">
                                //         <p>
                                //             {chat?.users
                                //                 ?.filter((user) => user.email !== auth.currentUser.email) // Exclude the logged-in user
                                //                 .map((user) => (
                                //                     <p
                                //                         key={user.uid} // Ensure unique key for each user
                                //                         onClick={() => {
                                //                             startChat(user);
                                //                             console.log(user);
                                //                         }}
                                //                     >
                                //                         {user?.fullName}: {chat.lastMessage || "No messages yet"}
                                //                     </p>
                                //                 ))}
                                //         </p>
                                //     </div>
                                // ))

                                chats.map((chat) => (
                                    <div key={chat.id} className="chat-item">
                                        <p>
                                            {chat?.users
                                                ?.filter((user) => user.email !== auth.currentUser.email)
                                                .map((user) => (
                                                    <p
                                                        key={user.uid}
                                                        onClick={() => {
                                                            startChat(user);
                                                            console.log(user);
                                                        }}
                                                    >
                                                        {user?.fullName}: {chat.lastMessage || "No messages yet"}
                                                    </p>
                                                ))}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No chats available</p>
                            )}
                        </div>
                        <hr />
                        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                            <input type="text" placeholder="Search for a friend" className="mb-4 px-4 py-2 border rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <button className="bg-blue-500 text-white px-6 py-2 rounded" onClick={handleSearch}>
                                Search
                            </button>

                            {users.length > 0 && (
                                <div className="mt-6">
                                    {users.map((user) => (
                                        <div
                                            key={user.uid}
                                            className="flex justify-between items-center border-b py-2 px-4"
                                            onClick={() => {
                                                startChat(user);
                                                console.log(user);
                                            }}
                                        >
                                            <h3>
                                                {user.fullName}{" "}
                                                <span>
                                                    <i>
                                                        <small>@{user.username}</small>
                                                    </i>
                                                </span>
                                            </h3>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedUser && (
                                <div className="mt-6">
                                    <h2>Chat with: {selectedUser.username}</h2>
                                    <p>Status: {userStatus || "Loading..."}</p>
                                    {userStatus !== "online" && <p>Last seen: {getTimeAgo(userLastSeen?.seconds) || "Loading..."}</p>}
                                    {/* <Chat chatId={auth.currentUser.uid < selectedUser.uid ? `${auth.currentUser.uid}-${selectedUser.uid}` : `${selectedUser.uid}-${auth.currentUser.uid}`} user1={auth.currentUser.email} user2={selectedUser.email} /> */}
                                    <Chat
                                        chatId={auth.currentUser.uid < selectedUser.uid ? `${auth.currentUser.uid}-${selectedUser.uid}` : `${selectedUser.uid}-${auth.currentUser.uid}`}
                                        user1={auth.currentUser}
                                        user2={selectedUser} // Pass the full selected user object
                                    />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h1>{isLogin ? "Login" : "Sign Up"}</h1>
                        <input type="text" placeholder="Full Name" value={userData?.fullName} name="fullName" onChange={handleChangeUserData} /> <br />
                        <input type="email" placeholder="Email" value={userData?.email} name="email" onChange={handleChangeUserData} /> <br />
                        <input type="password" placeholder="Password" value={userData?.password} name="password" onChange={handleChangeUserData} /> <br /> <br />
                        <button onClick={handleAuth}>{isLogin ? "Login" : "Sign Up"}</button> <br /> <br />
                        <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Create an Account" : "Back to Login"}</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
