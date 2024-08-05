import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDQxWWZ-2LYPpE5JA0e9HxqSkgXU8T15XY",
  authDomain: "cloud-clip-6b5b0.firebaseapp.com",
  databaseURL: "https://cloud-clip-6b5b0-default-rtdb.firebaseio.com",
  projectId: "cloud-clip-6b5b0",
  storageBucket: "cloud-clip-6b5b0.appspot.com",
  messagingSenderId: "1022149034466",
  appId: "1:1022149034466:web:6846f8c12c874c9d7f79bb",
  measurementId: "G-TPLKB0TCW5"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };