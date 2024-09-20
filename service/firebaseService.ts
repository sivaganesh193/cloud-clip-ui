import { db } from '../firebaseConfig'; // Import your Firestore instance
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { CustomClipboard, Device, Shared, User } from './models'; // Import the User interface

/**
 * Adds a user with a given ID to the Firestore users collection.
 * 
 * @param userId - The custom ID for the user document.
 * @param user - The user object containing email, name, createdAt, and updatedAt.
 */
export const createUser = async (userId: string, user: User): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userData: User = {
            ...user,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };
        await setDoc(userRef, userData);
        console.log('User added with ID: ', userId);
    } catch (error) {
        console.error('Error adding user: ', error);
    }
}

/**
 * Updates a user with a given ID in the Firestore users collection.
 * 
 * @param id - The ID of the user document to be updated.
 * @param name - The new name to set for the user.
 */
export const updateUser = async (id: string, name: string): Promise<void> => {
    try {
        const userDocRef = doc(db, 'users', id);
        const userData = {
            name: name,
            updatedAt: Timestamp.now()
        };
        await updateDoc(userDocRef, userData);
        console.log(`User with ID ${id} updated successfully`);
    } catch (error) {
        console.error('Error updating user: ', error);
    }
};

/**
 * Fetches a user from the Firestore users collection based on the given user ID.
 * 
 * @param userId - The ID of the user document to fetch.
 * @returns The user data if found, or null if the user does not exist.
 */
export const fetchUser = async (userId: string): Promise<User | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            return userData;
        } else {
            console.log('No such user!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user: ', error);
        return null;
    }
}

/**
 * Fetches devices from the Firestore devices collection based on the user ID.
 * 
 * @param userId - The ID of the user whose devices are to be fetched.
 * @returns A promise that resolves to an array of devices.
 */
export const fetchDevices = async (userId: string | null): Promise<Device[]> => {
    if (userId) {
        try {
            const devicesRef = collection(db, 'devices');
            const q = query(devicesRef, where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const devicesList: Device[] = querySnapshot.docs.map(doc => ({
                ...doc.data() as Device, // Spread the existing device data
                id: doc.id // Add the doc ID as deviceId
            }));
            console.log('Devices:', devicesList);
            return devicesList;
        } catch (error) {
            console.error('Error fetching devices: ', error);
            return [];
        }
    }
    return [];
};

/**
 * Sets up a real-time listener for devices based on the user ID.
 * 
 * @param userId - The ID of the user whose devices are to be listened to.
 * @param onUpdate - A callback function that is called with the updated devices.
 * @returns A function to unsubscribe from the real-time updates.
 */
export const listenToDevices = (userId: string, onUpdate: (devices: Device[]) => void) => {
    try {
        const devicesRef = collection(db, 'devices');
        const q = query(devicesRef, where('userId', '==', userId));

        // Set up a real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const devicesList: Device[] = querySnapshot.docs.map(doc => ({
                ...doc.data() as Device, // Spread the existing device data
                id: doc.id // Add the doc ID as deviceId
            }));
            console.log('Refetched Devices');
            onUpdate(devicesList); // Call the callback with the updated devices
        });

        // Return the unsubscribe function so the caller can stop listening if needed
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up real-time listener for devices: ', error);
        throw error;
    }
};

/**
 * Creates a new device document in the Firestore devices collection.
 * 
 * @param device - The device object to be added to the collection.
 */
export const createDevice = async (device: Device): Promise<void> => {
    try {
        const devicesRef = collection(db, 'devices');
        const docRef = await addDoc(devicesRef, {
            ...device,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now() // Corrected field name to `updatedAt`
        });
        console.log(`Device with ID ${docRef.id} created successfully`);
    } catch (error) {
        console.error('Error creating device: ', error);
    }
};

/**
 * Updates a device document in the Firestore devices collection.
 * 
 * @param id - The ID of the device document to be updated.
 * @param updatedDevice - The object containing the updated device data.
 */
export const updateDevice = async (id: string, updatedDevice: Partial<Device>): Promise<void> => {
    try {
        const deviceDocRef = doc(db, 'devices', id);
        await updateDoc(deviceDocRef, {
            ...updatedDevice,
            updatedAt: Timestamp.now() // Update the `updatedAt` field to the current timestamp
        });
        console.log(`Device with ID ${id} updated successfully`);
    } catch (error) {
        console.error('Error updating device: ', error);
    }
};

/**
 * Deletes a device document from the Firestore devices collection.
 * 
 * @param id - The ID of the device document to be deleted.
 */
export const deleteDevice = async (id: string): Promise<void> => {
    try {
        const deviceDocRef = doc(db, 'devices', id);
        await deleteDoc(deviceDocRef);
        console.log(`Device with ID ${id} deleted successfully`);
    } catch (error) {
        console.error('Error deleting device: ', error);
    }
};

/**
 * Fetches clipboard entries from the Firestore clipboards collection based on the user ID.
 * 
 * @param userId - The ID of the user whose clipboard entries are to be fetched.
 * @returns A promise that resolves to an array of clipboard entries.
 */
export const fetchClipboardEntries = async (userId: string): Promise<CustomClipboard[]> => {
    try {
        const clipboardsRef = collection(db, 'clipboards');
        const clipboardQuery = query(clipboardsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'), limit(10));
        const clipboardQuerySnapshot = await getDocs(clipboardQuery);
        const clipboardEntries: CustomClipboard[] = clipboardQuerySnapshot.docs.map(doc => ({
            ...doc.data() as CustomClipboard, // Spread the existing device data
            id: doc.id // Add the doc ID as deviceId
        }));
        return clipboardEntries;
    } catch (error) {
        console.error('Error fetching clipboard entries: ', error);
        return []; // Return an empty array in case of an error
    }
};

/**
 * Creates a new clipboard document in the Firestore clipboards collection with an auto-generated ID.
 * 
 * @param userId - The ID of the user who owns the clipboard entry.
 * @param deviceId - The ID of the device from which the clipboard entry was created.
 * @param content - The actual clipboard content.
 * @returns The ID of the created clipboard document.
 */
export const createClipboardEntry = async (clipboard: CustomClipboard): Promise<string> => {
    try {
        const clipboardsRef = collection(db, 'clipboards');
        const docRef = await addDoc(clipboardsRef, {
            ...clipboard,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        console.log(`Clipboard entry with ID ${docRef.id} created successfully`);
        return docRef.id; // Return the auto-generated document ID
    } catch (error) {
        console.error('Error creating clipboard entry: ', error);
        throw error; // Optionally, rethrow the error if needed
    }
};

/**
 * Sets up a real-time listener for clipboard entries for a given userId.
 * 
 * @param userId - The ID of the user whose clipboard entries are to be listened to.
 * @param onUpdate - A callback function that is called with the updated clipboard entries.
 * @returns A function to unsubscribe from the real-time updates.
 */
export const listenToClipboardEntries = (userId: string, onUpdate: (clipboards: CustomClipboard[]) => void) => {
    try {
        const clipboardsRef = collection(db, 'clipboards');
        const clipboardQuery = query(clipboardsRef, where('userId', '==', userId), orderBy('updatedAt', 'desc'));

        // Set up a real-time listener
        const unsubscribe = onSnapshot(clipboardQuery, (querySnapshot) => {
            const clipboardEntries: CustomClipboard[] = querySnapshot.docs.map(doc => ({
                ...doc.data() as CustomClipboard, // Spread the existing clipboard data
                id: doc.id // Add the doc ID
            }));
            console.log('Refetched Clipboard Entries');
            onUpdate(clipboardEntries); // Call the callback with the updated clipboard entries
        });

        // Return the unsubscribe function so the caller can stop listening if needed
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up real-time listener for clipboard entries: ', error);
        throw error;
    }
};

/**
 * Deletes a clipboard document from the Firestore clipboards collection.
 * 
 * @param clipboardId - The ID of the clipboard document to be deleted.
 */
export const deleteClipboardEntry = async (clipboardId: string): Promise<void> => {
    try {
        const clipboardDocRef = doc(db, 'clipboards', clipboardId);
        await deleteDoc(clipboardDocRef);
        console.log(`Clipboard entry with ID ${clipboardId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting clipboard entry: ', error);
    }
};

/**
 * Deletes all clipboard entries for a given userId using batch operations.
 * 
 * @param userId - The ID of the user whose clipboard entries are to be deleted.
 * @returns A promise that resolves when all clipboard entries have been deleted.
 */
export const deleteAllClipboardEntriesWithBatch = async (userId: string): Promise<void> => {
    try {
        const clipboardsRef = collection(db, 'clipboards');
        const clipboardQuery = query(clipboardsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(clipboardQuery);

        // Create a new batch
        const batch = writeBatch(db);

        // Add delete operations to the batch
        querySnapshot.docs.forEach(docSnapshot => {
            const clipboardDocRef = doc(db, 'clipboards', docSnapshot.id);
            batch.delete(clipboardDocRef);
        });

        // Commit the batch
        await batch.commit();
        
        console.log(`All clipboard entries for user ${userId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting all clipboard entries with batch: ', error);
        throw error;
    }
};

export const updateTimestampInClipboard = async (clipboardId: string): Promise<void> => {
    try {
        const clipboardRef = doc(db, 'clipboards', clipboardId); 
        await updateDoc(clipboardRef, {
            updatedAt: new Date() 
        });
        console.log('Timestamp updated successfully!');
    } catch (error) {
        console.error('Error updating timestamp: ', error);
    }
};

/**
 * Sets up a real-time listener for shared links along with their associated clipboard content for a given userId.
 * 
 * @param userId - The ID of the user whose shared links are to be listened to.
 * @param onUpdate - A callback function that is called with the updated shared links.
 * @returns A function to unsubscribe from the real-time updates.
 */
export const listenToSharedLinks = (userId: string, onUpdate: (sharedLinks: Shared[]) => void) => {
    try {
        const sharedRef = collection(db, 'sharedLinks');
        const q = query(sharedRef, where('userId', '==', userId), where('expiryAt', '>', Timestamp.now()), orderBy('updatedAt', 'desc'));

        // Set up a real-time listener
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const sharedLinks: Shared[] = querySnapshot.docs.map(doc => ({
                ...doc.data() as Shared, // Spread the existing data
                id: doc.id // Add the doc ID
            }));
            console.log('Refetched Shared Links');
            onUpdate(sharedLinks); // Call the callback with the updated shared links
        });

        // Return the unsubscribe function so the caller can stop listening if needed
        return unsubscribe;
    } catch (error) {
        console.error('Error setting up real-time listener for shared links: ', error);
        throw error;
    }
};

export const deleteAllSharedLinks = async (userId: string) => {
    try {
        const sharedRef = collection(db, 'sharedLinks');
        const q = query(sharedRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('All shared links deleted successfully.');
    } catch (error) {
        console.error('Error deleting all shared links: ', error);
        throw error;
    }
};


/**
 * Creates a new shared link in the Firestore shared collection with an auto-generated ID.
 * 
 * @param shared - The shared object to be created.
 * @returns The ID of the created shared link document.
 */
export const createSharedLink = async (shared: Shared): Promise<string> => {
    try {
        const sharedRef = collection(db, 'sharedLinks');
        const now = Timestamp.now();
        const docRef = await addDoc(sharedRef, {
            ...shared,
            createdAt: now,
            updatedAt: now,
            expiryAt: new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds)
        });
        console.log(`Shared link with ID ${docRef.id} created successfully`);
        return docRef.id;
    } catch (error) {
        console.error('Error creating shared link: ', error);
        throw error;
    }
};

/**
 * Deletes a shared link from the Firestore shared collection.
 * 
 * @param sharedId - The ID of the shared link to be deleted.
 * @returns A promise that resolves when the shared link is deleted.
 */
export const deleteSharedLink = async (sharedId: string): Promise<void> => {
    try {
        const sharedDocRef = doc(db, 'sharedLinks', sharedId);
        await deleteDoc(sharedDocRef);
        console.log(`Shared link with ID ${sharedId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting shared link: ', error);
        throw error;
    }
};

/**
 * Fetches a shared link from the Firestore shared collection based on the link's code.
 * 
 * @param code - The code of the shared link to be fetched. The code should be a string.
 * @returns A promise that resolves to the fetched shared link data if found, or null if no matching document is found.
 */
export const fetchSharedLink = async (code: string): Promise<Shared | null> => {
    try {
        console.log("code",code);
        
        // Create a query to find the shared link document by code
        const q = query(collection(db, 'sharedLinks'), where('code', '==', code));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log("No matching documents found for code:", code);
            return null;
        }
        // Assuming there is only one document per code
        const sharedData = querySnapshot.docs[0].data() as Shared;
        return sharedData;
    } catch (error) {
        console.error('Error fetching shared link:', error);
        throw error;
    }
};

