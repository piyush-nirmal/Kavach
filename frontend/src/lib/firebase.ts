import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCoGBcfZc0eMAOzbECDv4LEEFBloruZ7Ts",
    authDomain: "kavach-1b28c.firebaseapp.com",
    projectId: "kavach-1b28c",
    storageBucket: "kavach-1b28c.firebasestorage.app",
    messagingSenderId: "8001327790",
    appId: "1:8001327790:web:c701c8d68fd61e7018533f",
    measurementId: "G-L1NFNKPWWR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
