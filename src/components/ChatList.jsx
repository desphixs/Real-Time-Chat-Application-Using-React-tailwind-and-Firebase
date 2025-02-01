import { useEffect, useMemo, useState } from "react";
import { RiMore2Fill } from "react-icons/ri";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import defaultAvatar from "../../public/assets/default.jpg";
import { formatTimestamp } from "../utils/formatTimestamp";
import SearchModal from "./SearchModal";
import { auth, db, listenForChats } from "../firebase/firebase";

const ChatList = ({ setSelectedUser }) => {
    const [chats, setChats] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = listenForChats(setChats);
        return () => {
            unsubscribe();
        };
    }, []);

    const sortedChats = useMemo(() => {
        return [...chats].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    }, [chats]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data());
                } else {
                    console.error("User document not found");
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const startChat = (user) => {
        setSelectedUser(user);
    };

    return (
        <section className="relative hidden lg:flex flex-col items-start justify-start bg-[#fff] h-[100vh] w-[100%] md:w-[600px] ">
            <header className="flex items-center justify-between w-[100%] border-b border-b-1 p-4 sticky md:static top-0 z-[100]">
                <main className="flex items-center gap-3">
                    <img className="h-[44px] w-[44px] object-cover rounded-full" src={user?.image || defaultAvatar} />
                    <span>
                        <h3 className="p-0 font-semibold text-[#2A3D39] md:text-[17px]">{user?.fullName || "ChatFrik User"}</h3>
                        <p className="p-0 font-light text-[#2A3D39] text-[15px]">@{user?.username || "chatfrik"}</p>
                    </span>
                </main>
                <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg">
                    <RiMore2Fill color="#01AA85" className="w-[28px] h-[28px]" />
                </button>
            </header>

            <div className=" w-[100%] mt-[10px] px-5">
                <header className="flex items-center justify-between ">
                    <h3 className="text-[16px] ">Messages ({chats?.length || 0})</h3>
                    <SearchModal startChat={startChat} />
                </header>
            </div>

            <main className="flex flex-col items-start gap-6 w-[100%] mt-[1.5rem] pb-3 custom-scrollbar">
                {sortedChats.map((chat) => (
                    <a key={chat.uid} className="item flex items-start justify-between w-[100%] border-b border-b-1 border-red px-5 pb-2">
                        {chat?.users
                            ?.filter((user) => user.email !== auth.currentUser.email)
                            .map((user) => (
                                <>
                                    <div
                                        className="flex items-start gap-3"
                                        onClick={() => {
                                            startChat(user);
                                        }}
                                    >
                                        <img src={user?.image || defaultAvatar} alt={1} className="h-[40px] w-[40px rounded-full" />
                                        <span>
                                            <h2 className="p-0 font-semibold text-[#2A3D39] text-[17px]">{user?.fullName}</h2>
                                            <p className="p-0 font-light text-[#2A3D39] text-[14px]">{chat?.lastMessage?.slice(0, 35) || "No messages yet"}</p>
                                        </span>
                                    </div>

                                    <p className="p-0 font-regular text-gray-400 text-[11px]">{formatTimestamp(chat?.lastMessageTimestamp)}</p>
                                </>
                            ))}
                    </a>
                ))}
            </main>
        </section>
    );
};

export default ChatList;
