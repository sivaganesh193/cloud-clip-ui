import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyCLz2cD3T_LLmKNZr8I9y9eGL2bcn4Cc14",
    authDomain: "cloud-clip-d169d.firebaseapp.com",
    projectId: "cloud-clip-d169d",
    storageBucket: "cloud-clip-d169d.appspot.com",
    messagingSenderId: "233163298991",
    appId: "1:233163298991:web:fa8764c35933ca02409c5a"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
const auth = getAuth(app);

export { app, db, auth };