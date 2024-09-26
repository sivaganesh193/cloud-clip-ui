import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//     apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
//     projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
// };

// const firebaseConfig = {
//     apiKey: "AIzaSyCLz2cD3T_LLmKNZr8I9y9eGL2bcn4Cc14",
//     authDomain: "cloud-clip-d169d.firebaseapp.com",
//     databaseURL: "https://cloud-clip-d169d-default-rtdb.firebaseio.com",
//     projectId: "cloud-clip-d169d",
//     storageBucket: "cloud-clip-d169d.appspot.com",
//     messagingSenderId: "233163298991",
//     appId: "1:233163298991:web:fa8764c35933ca02409c5a"
// };

const firebaseConfig = {
    apiKey: "AIzaSyAPTFzLjWbxwyE3-kUkGfV1-GsnK55gNxo",
    authDomain: "cloud-clip-us.firebaseapp.com",
    databaseURL: "https://cloud-clip-us-default-rtdb.firebaseio.com",
    projectId: "cloud-clip-us",
    storageBucket: "cloud-clip-us.appspot.com",
    messagingSenderId: "673044874369",
    appId: "1:673044874369:web:35a0e3ee39f18ab6e73980"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let auth: any;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

export { app, db, auth };