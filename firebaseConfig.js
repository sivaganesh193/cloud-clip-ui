import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
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

const firebaseAltConfig = {
    apiKey: "AIzaSyAltRIADhO7wYWI2F-niM9iahWoFMzZ8ZY",
    authDomain: "backup-cloudclip.firebaseapp.com",
    projectId: "backup-cloudclip",
    storageBucket: "backup-cloudclip.appspot.com",
    messagingSenderId: "213682652022",
    appId: "1:213682652022:web:5a8901876336cd5db93057"
};

const app = initializeApp(firebaseAltConfig);
const db = getFirestore(app);

let auth;
if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
}

export { app, db, auth };