import { db } from '../firebaseConfig'; // Import your Firestore instance
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { Clipboard, Device, User } from './models'; // Import the User interface

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
            console.log('User data:', userData);
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
export const fetchDevices = async (userId: string): Promise<Device[]> => {
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
        console.log(docRef);
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
export const fetchClipboardEntries = async (userId: string): Promise<Clipboard[]> => {
    try {
        // Reference to the clipboards collection
        const clipboardsRef = collection(db, 'clipboards');
        
        // Query to filter clipboard entries based on the user ID
        const q = query(clipboardsRef, where('userId', '==', userId));
        
        // Fetch documents that match the query
        const querySnapshot = await getDocs(q);
        
        // Map through documents and extract clipboard data
        const clipboardEntries: Clipboard[] = querySnapshot.docs.map(doc => ({
            ...doc.data() as Clipboard, // Spread the existing clipboard data
            id: doc.id // Add the doc ID as clipboardId
        }));
        
        // Log the fetched clipboard entries
        console.log('Clipboard Entries:', clipboardEntries);
        
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
export const createClipboardEntry = async (clipboard: Clipboard): Promise<string> => {
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