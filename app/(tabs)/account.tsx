import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, SafeAreaView, FlatList, Platform, Modal, Button, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { AuthContext } from '@/auth/AuthContext';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { createDevice, deleteDevice, fetchDevices, fetchUser } from '@/service/firebaseService';
import { getDeviceId, getDeviceOS, setDeviceId } from '@/service/deviceService';
import { Device } from '@/service/models';
import * as Crypto from 'expo-crypto';
import Header from '@/components/Header';
import { useNavigation } from '@react-navigation/native';

export default function Account() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [name, setName] = useState('');
    const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const authContext = useContext(AuthContext); // Get AuthContext
    if (!authContext) {
        throw new Error("AuthContext must be used within an AuthProvider");
    }
    const { user, logout } = authContext; // Use AuthContext to get the user
    const email = user?.email || 'user@example.com';

    useEffect(() => {
        const fetchData = async () => {
            if (user && currentDeviceId) {
                const devices = await fetchDevices(user.uid);
                setDevices(devices);
                const matchingIndex = currentDeviceId ? devices.findIndex(device => device.deviceId?.includes(currentDeviceId)) : -1;
                console.log(matchingIndex, currentDeviceId);
                setHighlightIndex(matchingIndex);
            }
        };

        const initialize = async () => {
            try {
                // Fetch device ID and user details concurrently
                const deviceId = await getDeviceId();
                setCurrentDeviceId(deviceId);

                if (user) {
                    const userData = await fetchUser(user.uid);
                    if (userData) {
                        setName(userData.name);
                    } else {
                        console.log('User not found');
                    }
                }

                if (deviceId) {
                    fetchData();
                }

                // Start the interval only after the currentDeviceId is set
                const intervalId = setInterval(() => {
                    fetchData();
                }, 5000);

                // Cleanup the interval on unmount
                return () => clearInterval(intervalId);
            } catch (error) {
                console.error('Error during initialization:', error);
            }
        };

        initialize();
    }, [user, currentDeviceId]);

    const handleSave = () => {
        if (user) {
            updateUser(user.uid, name);
        }
    };

    const handleOpen = () => {
        setModalVisible(true);
    };

    const handleAddDevice = () => {
        if (deviceName.length < 5) {
            setErrorMessage('Device name must be at least 5 characters long.');
            return;
        }
        const deviceId = currentDeviceId + '_*_' + deviceName;
        const deviceOS = getDeviceOS();
        console.log('Device Id stored: ', deviceId);
        console.log('Device OS: ', deviceOS);
        if (user) {
            createDevice({ deviceName: deviceName, deviceId: deviceId, os: deviceOS, userId: user.uid }).then(() => {
                // fetchData();
                setModalVisible(false);
                setDeviceName(''); // Reset the input field
                setErrorMessage(''); // Reset the error message
            })
        }
    };

    const handleSync = (title: string) => {
        console.log(`Share link: ${title}`);
    };

    const handleRemove = (id: string) => {
        deleteDevice(id);
        // fetchData();
    };

    const handleLogout = () => {
        logout(); // Call the logout function from useAuth
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

    // const renderItem = ({ item }: { item: Device }) => {
    //     return (
    //         <View style={[true && styles.itemHighlighted, isDarkMode ? styles.itemContainerLight : styles.itemContainerLight]}>
    //             <View>
    //                 <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.deviceName}</Text>
    //                 <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Type: {item.os}</Text>
    //             </View>
    //             <TouchableOpacity onPress={() => handleSync(item.id || '')}>
    //                 <Ionicons name="sync-outline" size={24} color={'black'} />
    //             </TouchableOpacity>
    //             <TouchableOpacity onPress={() => handleRemove(item.id || '')}>
    //                 <Ionicons name="trash-outline" size={24} color={'black'} />
    //             </TouchableOpacity>
    //         </View>
    //     );
    // };

    const renderItem = ({ item, index }: { item: Device, index: number }) => {
        return (
            <View style={[isDarkMode ? styles.itemContainerLight : styles.itemContainerLight]}>
                <View>
                    <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.deviceName}</Text>
                    <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Type: {item.os}</Text>
                </View>
                <TouchableOpacity onPress={() => handleSync(item.deviceId || '')}>
                    <Ionicons name="sync-outline" size={24} color={'black'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemove(item.id || '')}>
                    <Ionicons name="trash-outline" size={24} color={'black'} />
                </TouchableOpacity>
            </View>
        );
    };

    const navigation = useNavigation();
    return (
        <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
            {/* <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Device Name: </Text>
                        <TextInput
                            style={styles.input}
                            value={deviceName}
                            onChangeText={setDeviceName}
                        />
                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                        <TouchableOpacity
                            style={isDarkMode ? styles.buttonDark : styles.buttonLight}
                            onPress={handleAddDevice}
                        >
                            <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>Add Device</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal> */}
            <Header navigation={navigation} />
            <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
                {user ? (
                    <View style={styles.content}>
                        <ThemedText type="title" style={styles.text}>Your Account</ThemedText>
                        <Text>{'\n'}</Text>
                        <View style={styles.fieldContainer}>
                            <ThemedText type="subtitle" style={styles.text}>Email</ThemedText>
                            <TextInput
                                style={isDarkMode ? styles.inputDark : styles.inputLight}
                                value={email}
                                editable={false}
                                placeholderTextColor={isDarkMode ? '#999' : '#999'}
                            />
                        </View>

                        <View style={styles.fieldContainer}>
                            <ThemedText type="subtitle" style={styles.text}>Name</ThemedText>
                            <TextInput
                                style={isDarkMode ? styles.inputDark : styles.inputLight}
                                onChangeText={setName}
                                value={name}
                                placeholder="Enter your name"
                                placeholderTextColor={'slategrey'}
                            />
                        </View>
                        <TouchableOpacity
                            style={isDarkMode ? styles.buttonDark : styles.buttonLight}
                            onPress={handleSave}
                        >
                            <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>Save</Text>
                        </TouchableOpacity>
                        <Text>{'\n'}</Text>
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
                                    styles.addDeviceButton,
                                    (highlightIndex !== -1) && styles.buttonDisabled // Apply disabled style if the button is disabled
                                ]}
                                onPress={handleOpen}
                                disabled={(highlightIndex !== -1)} // Disable the button if needed
                            >
                                <Text style={styles.addDeviceButtonText}>
                                    Add Current Device
                                </Text>
                            </TouchableOpacity>
                        </ThemedView>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>Click here to logout!</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ThemedView style={styles.containerCenter}>
                        <MaterialCommunityIcons name="hand-wave" size={24} color="black" />
                        <ThemedText type="subtitle" style={styles.textLight}>Hi there! {'\n'}</ThemedText>
                        <ThemedText type="subtitle" style={styles.textLight}>Welcome! Please log in to access your account and enjoy personalized features.
                        </ThemedText>
                    </ThemedView>
                )}
            </ThemedView >
        </SafeAreaView >

    );
}

const styles = StyleSheet.create({
    safeAreaLight: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    safeAreaDark: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    text: {
        color: '#000',
    },
    containerLight: {
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    containerDark: {
        backgroundColor: '#fff',
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
        color: '#000',
    },
    inputLight: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        marginTop: 2,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        color: '#000',
    },
    inputDark: {
        height: 40,
        borderColor: '#000',
        borderWidth: 1,
        marginTop: 2,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        color: '#000',
    },
    buttonLight: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    buttonDark: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#000',
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
    containerCenter: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        width: Platform.OS === 'web' ? '50%' : '100%', // Center content on web, full width on mobile
        alignSelf: Platform.OS === 'web' ? 'center' : 'stretch', // Center align on web
    },
    logoutButton: {
        marginTop: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    logoutButtonText: {
        fontWeight: 'bold',
        cursor: 'pointer',
        textDecorationColor: 'black',
        textDecorationStyle: 'solid',
        textDecorationLine: 'underline'
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
    buttonDisabled: {
        backgroundColor: 'grey', // Disabled button color
        opacity: 0.5, // Reduced opacity to indicate disabled state
    },
    addDeviceButton: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBlockColor: '#000',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 0
    },
    addDeviceButtonText: {
        color: 'black',
        fontWeight: 'bold'
    },
    // modalContainer: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // },
    // modalView: {
    //     width: 300,
    //     backgroundColor: 'white',
    //     borderRadius: 10,
    //     padding: 20,
    //     alignItems: 'center',
    //     shadowColor: '#000',
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.25,
    //     shadowRadius: 4,
    //     elevation: 5,
    // },
    // modalText: {
    //     fontSize: 18,
    //     marginBottom: 15,
    // },
    // input: {
    //     height: 40,
    //     width: '100%',
    //     borderColor: '#ccc',
    //     borderWidth: 1,
    //     marginBottom: 20,
    //     paddingHorizontal: 10,
    // },
    // errorText: {
    //     color: 'red',
    //     marginBottom: 10,
    // },
});