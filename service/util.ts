import { Platform } from 'react-native';
import { Linking } from 'react-native';


export const getDomain = () => {
    if (Platform.OS === 'web') {
        return window.location.origin; // Returns the domain in a web environment
    } else {
        return Linking.getInitialURL() // Returns the domain in a React Native environment
    }
};