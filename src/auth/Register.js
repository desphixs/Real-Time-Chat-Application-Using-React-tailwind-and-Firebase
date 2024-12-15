import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const [user, setUser] = useState(null);

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

    const handleAuth = async () => {
        try {
            if (isLogin) {
                const response = await signInWithEmailAndPassword(auth, email, password);
                console.log(response?.data);
                console.log(response);
                alert("Logged in successfully!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Account created successfully!");
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl mb-6">{isLogin ? "Login" : "Sign Up"}</h1>
            <input type="email" placeholder="Email" className="mb-4 px-4 py-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="mb-4 px-4 py-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="bg-blue-500 text-white px-6 py-2 rounded" onClick={handleAuth}>
                {isLogin ? "Login" : "Sign Up"}
            </button>
            <button className="mt-4 text-blue-500" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Create an Account" : "Back to Login"}
            </button>

            <hr />
            <div className="flex flex-col items-center justify-center h-screen">
                {user ? (
                    <>
                        <h1 className="text-2xl mb-4">Welcome, {user.email}!</h1>
                        <p>Your UID: {user.uid}</p>
                    </>
                ) : (
                    <h1>Please log in</h1>
                )}
            </div>
        </div>
    );
}

export default Register;
