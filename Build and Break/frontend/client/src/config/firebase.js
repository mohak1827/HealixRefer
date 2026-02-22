import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBLJVySyN-zrEGzhtwm1s9Si7mX6WDQmdE",
    authDomain: "healixrefer.firebaseapp.com",
    projectId: "healixrefer",
    storageBucket: "healixrefer.firebasestorage.app",
    messagingSenderId: "370243970518",
    appId: "1:370243970518:web:5cfd4442b93d67a9c17077",
    measurementId: "G-SNQ55HW06R"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
