import React, { useState } from "react";
import { RiChatAiLine, RiFolderUserLine, RiNotification4Line, RiFile4Line, RiBardLine, RiArrowDownSFill, RiShutDownLine } from "react-icons/ri";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

import logo from "../../public/assets/logo.png";
import ModalChatList from "./ModalChatList";

const NavLinks = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleModal = (e) => {
        e.preventDefault();
        console.log("Modal toggle");
        setIsModalVisible((prev) => !prev);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <section className="sticky lg:static top-0 z-[200] lg:z-[0] flex items-center lg:items-start lg:justify-start bg-[#01AA85] h-[7vh] lg:h-[100vh] w-[100%] lg:w-[150px] py-8 lg:py-0">
            <main className="flex lg:flex-col items-center lg:gap-10 justify-between lg:px-0 w-[100%]">
                <div className="flex items-start justify-center lg:border-b border-b-1 lg:w-[100%] p-4">
                    <span className="flex items-center justify-center bg-[#fff] w-[57px] h-[48px] rounded-lg p-2">
                        <img src={logo} className="w-[56px] h-[52px] object-contain" />
                    </span>
                </div>

                <ul className="flex lg:flex-col flex-row items-center justify-start h-[30px] gap-7 md:gap-10 px-2 md:px-0">
                    <li>
                        <a href="#" className=" lg:text-[28px] text-[22px]">
                            <RiChatAiLine color="#fff" />
                        </a>
                    </li>

                    <li>
                        <a href="#" className=" lg:text-[28px] text-[22px]">
                            <RiFolderUserLine color="#fff" />
                        </a>
                    </li>

                    <li>
                        <a href="#" className=" lg:text-[28px] text-[22px]">
                            <RiNotification4Line color="#fff" />
                        </a>
                    </li>

                    <li>
                        <a href="#" className=" lg:text-[28px] text-[22px]">
                            <RiFile4Line color="#fff" />
                        </a>
                    </li>

                    <li>
                        <a href="#" className=" lg:text-[28px] text-[22px]">
                            <RiBardLine color="#fff" />
                        </a>
                    </li>

                    <li>
                        <button onClick={handleLogout} className=" lg:text-[28px] text-[22px]">
                            <RiShutDownLine color="#fff" />
                        </button>
                    </li>
                </ul>
                <button onClick={handleModal} className="block lg:hidden text-[30px] px-3">
                    <RiArrowDownSFill color="#fff" />
                </button>
                {isModalVisible && <ModalChatList />}
            </main>
        </section>
    );
};

export default NavLinks;
