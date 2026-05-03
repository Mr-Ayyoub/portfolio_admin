// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBtjCZAKjAyPWY1chfKpf_U2VB7uHl333E",
  authDomain: "portfolio-c6828.firebaseapp.com",
  databaseURL: "https://portfolio-c6828-default-rtdb.firebaseio.com",
  projectId: "portfolio-c6828",
  storageBucket: "portfolio-c6828.firebasestorage.app",
  messagingSenderId: "27282466436",
  appId: "1:27282466436:web:1a8640d9500b0fd55144d1",
  measurementId: "G-MLKX5R99ZZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };