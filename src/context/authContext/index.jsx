import React, { useContext, useEffect, useState, createContext, useCallback } from "react";
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

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const adminRef = doc(db, "admins", uid);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error("Access denied: Not an admin");
      }
      setCurrentUser(userCredential.user);
      setUserLoggedIn(true);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  // New function to get the logged-in admin user
  const getAdminLoggedIn = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      const adminRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        return user; // User is an admin
      }
    }
    return null; // No admin user is logged in
  }, []);

  const value = {
    currentUser,
    userLoggedIn,
    loading,
    login,
    logout,
    getAdminLoggedIn, // Expose the new function in the context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}