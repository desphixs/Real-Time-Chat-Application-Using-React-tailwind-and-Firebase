import React, { useState, useEffect, useMemo, useRef } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { auth, sendMessage, listenForMessages } from "../firebase/firebase";

import logo from "../../public/assets/logo.png";
import defaultAvatar from "../../public/assets/default.jpg";
import { formatTimestamp } from "../utils/formatTimestamp";

const ChatBox = ({ selectedUser }) => {
    const [messageText, setMessageText] = useState("");
    const [messages, setMessages] = useState([]);

    const chatId = auth.currentUser?.uid < selectedUser?.uid ? `${auth.currentUser?.uid}-${selectedUser?.uid}` : `${selectedUser?.uid}-${auth.currentUser?.uid}`;
    const user1 = auth.currentUser;
    const user2 = selectedUser;
    const senderEmail = auth.currentUser.email;
    const scrollRef = useRef(null);

    useEffect(() => {
        listenForMessages(chatId, setMessages);
    }, [chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sortedMessages = useMemo(() => {
        return [...messages].sort((a, b) => a.timestamp - b.timestamp);
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageText.trim()) {
            const newMessage = {
                sender: senderEmail,
                text: messageText,
                timestamp: {
                    seconds: Math.floor(Date.now() / 1000),
                    nanoseconds: 0,
                },
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            sendMessage(messageText, chatId, user1?.uid, user2?.uid);
            setMessageText("");
        }
    };

    return (
        <>
            {selectedUser ? (
                <section className="flex flex-col items-start justify-start h-screen w-[100%] bg-[#e5f6f3]">
                    <header className="border-b border-red w-[100%] h-[70px] md:h-fit p-4 bg-[#ffffff]">
                        <main className="flex items-center gap-3">
                            <span className="relative">
                                <img className="h-11 w-11 object-cover rounded-full" src={selectedUser?.image || defaultAvatar} alt="User" />
                            </span>
                            <span>
                                <h3 className="font-semibold text-[#2A3D39] text-lg">{selectedUser?.fullName}</h3>
                                <p className="font-light text-[#2A3D39] text-sm">@{selectedUser?.username}</p>
                            </span>
                        </main>
                    </header>

                    <main className="custom-scrollbar background-image relative h-[100vh] w-[100%] flex flex-col  justify-between">
                        <section className="px-3 pt-5 pb-20 lg:pb-10">
                            <div ref={scrollRef} className="overflow-auto h-[80vh] custom-scrollbar">
                                {sortedMessages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === senderEmail ? "flex-col items-end w-full" : "flex-col items-start w-full"} gap-5 mb-7`}>
                                        {msg.sender === senderEmail ? (
                                            <span className="flex gap-3 me-10">
                                                <div className="h-auto">
                                                    <div className="flex items-center justify-center rounded-lg bg-[#fff] p-6 shadow-sm">
                                                        <h4 className="font-medium text-[17px] text-gray-800 w-full break-words">{msg.text}</h4>
                                                    </div>
                                                    <p className="text-[#2A3D396E] text-xs text-right">{formatTimestamp(msg?.timestamp)}</p>
                                                </div>
                                            </span>
                                        ) : (
                                            <span className="flex gap-3 w-[40%] h-auto ms-10">
                                                <img className="h-11 w-11 object-cover rounded-full" src={selectedUser?.image || defaultAvatar} alt="User" />
                                                <div>
                                                    <div className="flex items-center justify-center rounded-lg bg-[#fff] p-6 w-full shadow-sm">
                                                        <h4 className="font-medium text-[17px] text-gray-800 w-full break-words">{msg.text}</h4>
                                                    </div>
                                                    <p className="text-[#2A3D396E] text-xs">{formatTimestamp(msg?.timestamp)}</p>
                                                </div>
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="sticky lg:bottom-0 bottom-[60px] p-3 h-fit w-[100%] ">
                            <form onSubmit={handleSendMessage} className="flex items-center bg-white h-[45px] w-[100%] px-2 rounded-lg relative shadow-lg">
                                <input value={messageText} onChange={(e) => setMessageText(e.target.value)} className="h-full text-[#2A3D39] outline-none text-[16px] pl-3 pr-[50px] rounded-lg w-[100%]" type="text" placeholder="Write your message..." />
                                <button type="submit" className="flex items-center justify-center absolute right-3 p-2 rounded-full bg-[#D9F2ED] hover:bg-[#C8EAE3]" aria-label="Send message">
                                    <RiSendPlaneFill color="#01AA85" className="w-[18px] h-[18px]" />
                                </button>
                            </form>
                        </div>
                    </main>
                </section>
            ) : (
                <section className="h-screen w-[100%] bg-[#e5f6f3]">
                    <div className="flex flex-col justify-center items-center h-[100vh]">
                        <img src={logo} width={100} alt="" />
                        <h1 className="text-[30px] font-bold text-teal-700 mt-5">Welcome to ChatFrik</h1>
                        <p className="text-gray-500">Connect and chat with friends easily, securely, fast and free.</p>
                    </div>
                </section>
            )}
        </>
    );
};

export default ChatBox;
