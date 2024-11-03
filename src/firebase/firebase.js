import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDax38EnBDg-QLwxhv7onovZiU8ucs66b0",
  authDomain: "login-signup-firebase-a7ce7.firebaseapp.com",
  projectId: "login-signup-firebase-a7ce7",
  storageBucket: "login-signup-firebase-a7ce7.firebasestorage.app",
  messagingSenderId: "635247669079",
  appId: "1:635247669079:web:41a5ed36e517b6ef801812",
  measurementId: "G-GD3TZST2HV"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export {app, auth};