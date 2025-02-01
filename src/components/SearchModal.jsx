import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { RiSearchLine } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";

import { db } from "../firebase/firebase";
import defaultAvatar from "../../public/assets/default.jpg";

const SearchModal = ({ startChat }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            alert("Please enter a search term.");
            return;
        }

        try {
            const normalizedSearchTerm = searchTerm.toLowerCase();
            const q = query(collection(db, "users"), where("username", ">=", normalizedSearchTerm), where("username", "<=", normalizedSearchTerm + "\uf8ff"));
            const querySnapshot = await getDocs(q);
            const foundUsers = [];
            querySnapshot.forEach((doc) => {
                foundUsers.push(doc.data());
            });
            setUsers(foundUsers);
            if (foundUsers.length === 0) {
                alert("No users found.");
            }
        } catch (error) {
            console.error("Error searching for users:", error);
        }
    };

    return (
        <div>
            <button onClick={openModal} className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg" type="button">
                <RiSearchLine color="#01AA85" className="w-[18px] h-[18px]" />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black bg-opacity-50" onClick={closeModal}>
                    <div className="relative p-4 w-full max-w-md right-50 max-h-full" onClick={(e) => e.stopPropagation()}>
                        <div className="relative bg-[#01AA85] w-[100%] rounded-md shadow-md">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Search Chat</h3>
                                <button type="button" onClick={closeModal} className="end-2.5 text-white bg-transparent hover:bg-[#D9F2ED] hover:text-[#01AA85] rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>

                            <div className="p-4 md:p-5">
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="search"
                                            id="search"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 outline-none"
                                            placeholder="Search..."
                                            required
                                        />

                                        <button className="bg-green-900 text-white px-3 py-2 rounded-lg" onClick={handleSearch}>
                                            <FaSearch />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {users.map((user) => (
                                        <div
                                            className="flex items-start gap-3 bg-[#15eabc34] p-2 rounded-lg cursor-pointer border border-[#ffffff20]"
                                            key={user.uid}
                                            onClick={() => {
                                                startChat(user);
                                                console.log(user);
                                                closeModal();
                                            }}
                                        >
                                            <img src={user?.image || defaultAvatar} alt={1} className="h-[40px] w-[40px rounded-full" />
                                            <span>
                                                <h2 className="p-0 font-semibold text-white text-[18px]">{user?.fullName}</h2>
                                                <p className="text-[13px] text-white">@{user.username}</p>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchModal;
