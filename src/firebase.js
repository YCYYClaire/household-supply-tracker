import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCYA3IYTm6mIVU6Ih_qoTck45ab9pmdb8I",
    authDomain: "wellhouse-tracker-86137.firebaseapp.com",
    projectId: "wellhouse-tracker-86137",
    storageBucket: "wellhouse-tracker-86137.firebasestorage.app",
    messagingSenderId: "32482055217",
    appId: "1:32482055217:web:5dc6eaddecc09e7eddb110"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
