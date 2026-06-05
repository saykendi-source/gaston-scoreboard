import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBm0p3xKeiJJ2-OwH8VAK4zJZvhwr4HJ4U",
  authDomain: "gaston-scoreboard.firebaseapp.com",
  databaseURL: "https://gaston-scoreboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gaston-scoreboard",
  storageBucket: "gaston-scoreboard.firebasestorage.app",
  messagingSenderId: "336217336747",
  appId: "1:336217336747:web:c6ddbfbc2617f68f6e40ee"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, update, onValue, get };
