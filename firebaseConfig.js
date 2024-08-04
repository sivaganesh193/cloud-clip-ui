import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";

// Initialize Firebase

const firebaseConfig = {
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app,db};