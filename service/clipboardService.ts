import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

/**
 * Sets the provided text to the clipboard.
 * 
 * @param text - The text to be copied to the clipboard.
 */
export const setClipboard = async (text: string | null): Promise<void> => {
    if(text) {
        try {
            await Clipboard.setStringAsync(text);
            console.log('Text copied to clipboard');
            Alert.alert('Copied to Clipboard', text);
        } catch (error) {
            console.error('Error copying text to clipboard:', error);
            throw error; // Optionally, rethrow the error if needed
        }
    }
};

/**
 * Gets the current text from the clipboard.
 * 
 * @returns The text from the clipboard.
 */
export const getClipboard = async (): Promise<string> => {
    try {
        const text = await Clipboard.getStringAsync();
        console.log('Text retrieved from clipboard:', text);
        return text;
    } catch (error) {
        console.error('Error retrieving text from clipboard:', error);
        throw error; // Optionally, rethrow the error if needed
    }
};

let lastClipboardContent = '';

/**
 * Checks for clipboard content changes.
 * @param callback - Function to call with new clipboard content if changed.
 */
export const checkClipboardChanges = async (callback: (content: string) => void) => {
    try {
        const clipboardContent = await Clipboard.getStringAsync();
        if (clipboardContent !== lastClipboardContent) {
            lastClipboardContent = clipboardContent;
            callback(clipboardContent);
        }
        else {
            console.log("still same: ", clipboardContent);
        }
    } catch (error) {
        console.error('Error checking clipboard:', error);
    }
};