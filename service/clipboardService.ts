import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { createClipboardEntry, createSharedLink } from './firebaseService';
import * as Crypto from 'expo-crypto';
import { getDomain } from './util';
/**
 * Sets the provided text to the clipboard.
 * 
 * @param text - The text to be copied to the clipboard.
 */
export const setClipboard = async (text: string | null, showAlert: (message: string) => void, alertMessage: string): Promise<void> => {
    if (text) {
        try {
            await Clipboard.setStringAsync(text);
            showAlert(alertMessage);
        } catch (error) {
            showAlert('An unexpected error occured');
            throw error;
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
        return text;
    } catch (error) {
        // console.error('Error retrieving text from clipboard:', error);
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

export const getSharedLinkURL = (code: string): string => {
    const sharedLinkURL = `${getDomain()}/shared/${code}`;
    console.log(sharedLinkURL);
    return sharedLinkURL;
}

export const handleShare = async (content: string, user: any, deviceId: string, deviceName: string, showAlert: (message: string) => void, setTextToShare?: (text: string) => void) => {
    if (content) {
        try {
            let clipRef: any;
            let sharedRef: any;
            if (user && deviceId) {
                clipRef = await createClipboardEntry({
                    userId: user.uid,
                    deviceId: deviceId,
                    deviceName: deviceName,
                    content: content
                });
                sharedRef = await createSharedLink({
                    userId: user.uid,
                    clipboardId: clipRef,
                    content: content,
                    code: Crypto.randomUUID(), // will change url to smaller code
                })
            } else {
                clipRef = await createClipboardEntry({
                    userId: '',
                    deviceId: '',
                    content: content,
                    deviceName: ''
                });
                sharedRef = await createSharedLink({
                    userId: '',
                    clipboardId: clipRef,
                    content: content,
                    code: Crypto.randomUUID(), // will change url to smaller code
                })
            }
            const sharedLinkURL = getSharedLinkURL(sharedRef);
            await setClipboard(sharedLinkURL, showAlert, "Shared link created and copied to clipboard.");
            if (setTextToShare) setTextToShare('');
        }
        catch (error) {
            console.error('Error creating shared link: ', error);
        }
    }
    else {
        showAlert("Please enter text to share");
    }
};