import { Timestamp } from 'firebase/firestore';

// Interface for Users Collection
export interface User {
    email: string;
    name: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Interface for Devices Collection
export interface Device {
    id?: string;
    deviceId?: string;
    userId: string;
    deviceName: string;
    os: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Interface for Clipboards Collection
export interface Clipboard {
    id?: string;
    userId: string;
    deviceId: string;
    content: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Interface for Shared Collection
export interface Shared {
    clipboardId: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    code: string;
    expiryAt: Timestamp;
}