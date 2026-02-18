import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB46CO4zextyjoCat4_NSIuwIjYjcwJQfk",
    authDomain: "kashmiristitch.firebaseapp.com",
    projectId: "kashmiristitch",
    storageBucket: "kashmiristitch.firebasestorage.app",
    messagingSenderId: "706134153827",
    appId: "1:706134153827:web:77075829a79d141a90b656",
    measurementId: "G-3FQFTM1T1H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
