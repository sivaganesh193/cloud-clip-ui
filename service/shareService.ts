import { setClipboard } from "./clipboardService";
import { createClipboardEntry, createSharedLink } from "./firebaseService";
import { getDomain } from "./util";
import * as Crypto from 'expo-crypto';


export const getSharedLinkURL = (code: string): string => {
    console.log(code);
    const sharedLinkURL = `${getDomain()}/shared/${code}`;
    console.log(sharedLinkURL);
    return sharedLinkURL;
}

export const handleShare = async (content: string, user: any, deviceId: string, deviceName: string, showAlert: (message: string) => void, setTextToShare?: (text: string) => void) => {
    if (content) {
        try {
            let clipRef: any;
            let sharedRef: any;
            console.log(user,deviceId,deviceName);
            const code : string = Crypto.randomUUID();
            if (user) {
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
                    code: code, // will change url to smaller code
                })
            } else {
                sharedRef = await createSharedLink({
                    userId: '',
                    content: content,
                    code: code, // will change url to smaller code
                })
            }
            const sharedLinkURL = getSharedLinkURL(code);
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