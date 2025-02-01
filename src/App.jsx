import { useEffect, useState } from "react";

import { auth } from "./firebase/firebase";
import Login from "./components/Login";
import Register from "./components/Register";
import NavLinks from "./components/NavLinks";
import ChatBox from "./components/ChatBox";
import ChatList from "./components/ChatList";
import ModalChatList from "./components/ModalChatList";

function App() {
    const [isLogin, setIsLogin] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div>
            {user ? (
                <>
                    <div className="flex lg:flex-row flex-col items-start w-[100%]">
                        <NavLinks />
                        <ChatList setSelectedUser={setSelectedUser} />
                        <ChatBox selectedUser={selectedUser} />
                        <div className="hidden fixed top-[0px] right-[0px] shadow-lg">
                            <ModalChatList />
                        </div>
                    </div>
                </>
            ) : (
                <>{isLogin ? <Login isLogin={isLogin} setIsLogin={setIsLogin} /> : <Register isLogin={isLogin} setIsLogin={setIsLogin} />}</>
            )}
        </div>
    );
}

export default App;
