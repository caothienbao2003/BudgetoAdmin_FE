import React, { useContext, useEffect, useState, createContext } from "react";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminRef);

        if (adminDoc.exists()) {
          setCurrentUser(user);
          setUserLoggedIn(true);
        } else {
          await signOut(auth);
          setUserLoggedIn(false);
        }
      } else {
        setUserLoggedIn(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Check if user is in "admins" collection
    const adminRef = doc(db, "admins", uid);
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      await signOut(auth); // Immediately sign out non-admin users
      throw new Error("Access denied: Not an admin");
    }
    return userCredential.user;
  };

  const logout = () => signOut(auth);

  const value = {
    currentUser,
    userLoggedIn,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
