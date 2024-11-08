// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithCustomToken, getIdToken, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {apiKey: "AIzaSyDIQKNaRwnsxlCSZBACO1K7QRwSRlRjFwE",authDomain: "varnotsava-405511.firebaseapp.com",projectId: "varnotsava-405511",storageBucket: "varnotsava-405511.appspot.com",messagingSenderId: "808606184188",appId: "1:808606184188:web:b0e51856474ba07f701d79",measurementId: "G-WB3VPNT4EK"};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const firestore = getFirestore();

let provider = new GoogleAuthProvider();

window.addEventListener("login", () => {
    signInWithPopup(auth, provider);
});

window.addEventListener("logout", () => {
    auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
    window.getUser = () => {
        return user;
    }

    window.dispatchEvent(new CustomEvent("user-update"));
});

window.getUser = () => {
    return auth.currentUser;
}