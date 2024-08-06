import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/auth/AuthContext';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { deleteDevice, fetchDevices, fetchUser } from '@/service/firebaseService';
import { getDeviceId } from '@/service/deviceService';
import { Device } from '@/service/models';
import * as Crypto from 'expo-crypto';

export default function Account() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [name, setName] = useState('');
    const [currentDevice, setCurrentDevice] = useState<string | null>(null);
    const [devices, setDevices] = useState<any[]>([]); // Define the type for the state

    const authContext = useContext(AuthContext); // Get AuthContext
    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }
    const { user } = authContext; // Use AuthContext to get the user

    useEffect(() => {
        getDeviceId().then((deviceId) => setCurrentDevice(deviceId));
        if (user) {
            fetchUser(user.uid)
                .then((userData) => {
                    if (userData) {
                        setName(userData.name);
                    } else {
                        console.log('User not found');
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user: ', error);
                });
        }
    }, [user]);

    const fetchData = async () => {
        if (user) {
            fetchDevices(user.uid)
                .then((devices) => {
                    setDevices(devices);
                })
                .catch((error) => {
                    console.error('Error fetching devices: ', error);
                });
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const handleSave = () => {
        if (user) {
            updateUser(user.uid, name);
        }
    };

    const handleSync = (title: string) => {
        console.log(`Share link: ${title}`);
    };

    const handleRemove = (id: string) => {
        deleteDevice(id);
        fetchData();
    };

    const updateUser = async (id: string, name: string) => {
        try {
            const userDocRef = doc(db, 'users', id);
            await updateDoc(userDocRef, {
                name: name,
                updatedAt: Timestamp.now()
            });
            console.log(`User with ID ${id} updated successfully`);
        } catch (error) {
            console.error('Error updating user: ', error);
        }
    };

    const renderItem = ({ item }: { item: Device }) => {
        const isHighlighted = item.deviceId === currentDevice;
        console.log(currentDevice,isHighlighted);
        return (
            <View style={[isHighlighted && styles.itemHighlighted, isDarkMode ? styles.itemContainerLight : styles.itemContainerLight]}>
                <View>
                    <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.deviceName}</Text>
                    <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Expires in: {item.os}</Text>
                </View>
                <TouchableOpacity onPress={() => handleSync(item.deviceId || '')}>
                    <Ionicons name="sync-outline" size={24} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item.deviceId || '')}>
                    <Ionicons name="trash-outline" size={24} color={'black'} />
                </TouchableOpacity>
            </View>
        );
    };

    const isButtonDisabled = currentDevice ? devices.some(device => device.deviceId === currentDevice) : false;

    return (
        <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
            <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
                <ThemedText type="title">Account</ThemedText>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle">Email</ThemedText>
                    <Text style={isDarkMode ? styles.textDark : styles.textLight}>{user?.email}</Text>
                </View>
                <View style={styles.fieldContainer}>
                    <ThemedText type="subtitle">Name</ThemedText>
                    <TextInput
                        style={isDarkMode ? styles.inputDark : styles.inputLight}
                        onChangeText={setName}
                        value={name}
                        placeholder="Enter your name"
                        placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
                    />
                </View>
                <TouchableOpacity
                    style={isDarkMode ? styles.buttonDark : styles.buttonLight}
                    onPress={handleSave}
                >
                    <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>Save</Text>
                </TouchableOpacity>
            </ThemedView>
            <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
                <ThemedText type="subtitle">My Devices</ThemedText>
                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.deviceId || Crypto.randomUUID()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                />
                <TouchableOpacity
                    style={[
                        isDarkMode ? styles.buttonDark : styles.buttonLight,
                        isButtonDisabled && styles.buttonDisabled // Apply disabled style if the button is disabled
                    ]}
                    onPress={handleSave}
                    disabled={isButtonDisabled} // Disable the button if needed
                >
                    <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>
                        Add Current Device
                    </Text>
                </TouchableOpacity>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaLight: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
    },
    safeAreaDark: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    containerLight: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 16,
    },
    containerDark: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
        borderRadius: 16,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    textLight: {
        fontSize: 16,
        color: '#000',
    },
    textDark: {
        fontSize: 16,
        color: '#fff',
    },
    inputLight: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        color: '#000',
    },
    inputDark: {
        height: 40,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#1e1e1e',
        color: '#fff',
    },
    buttonDisabled: {
        backgroundColor: 'grey', // Disabled button color
        opacity: 0.5, // Reduced opacity to indicate disabled state
    },
    buttonLight: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#007bff',
        alignItems: 'center',
    },
    buttonDark: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#1e90ff',
        alignItems: 'center',
    },
    buttonTextLight: {
        color: '#fff',
        fontSize: 16,
    },
    buttonTextDark: {
        color: '#fff',
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    itemHighlighted: {
        backgroundColor: 'rgba(255, 215, 0, 0.3)', // Light yellow with transparency
        borderRadius: 5, // Rounded corners
        padding: 10, // Padding inside the item
        borderWidth: 2, // Border width
        borderColor: 'green', // Border color
        // Optionally, add shadow for better visibility
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    itemContainerLight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        elevation: 2,
    },
    itemContainerDark: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    itemTitleLight: {
        fontSize: 18,
        color: '#000',
    },
    itemTitleDark: {
        fontSize: 18,
        color: '#000',
    },
    itemExpiryLight: {
        fontSize: 14,
        color: '#aaa',
    },
    itemExpiryDark: {
        fontSize: 14,
        color: '#aaa',
    },
});