import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDax38EnBDg-QLwxhv7onovZiU8ucs66b0",
  authDomain: "login-signup-firebase-a7ce7.firebaseapp.com",
  projectId: "login-signup-firebase-a7ce7",
  storageBucket: "login-signup-firebase-a7ce7.appspot.com", // Fixed storageBucket URL
  messagingSenderId: "635247669079",
  appId: "1:635247669079:web:41a5ed36e517b6ef801812",
  measurementId: "G-GD3TZST2HV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics, Auth, and Firestore
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Export app, auth, db, and analytics (optional)
export { app, auth, db, analytics };
