import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Header from '../../components/Header';
import Description from '@/components/Description';
import { useNavigation } from 'expo-router';
import { AuthContext } from '@/auth/AuthContext'; // Import AuthContext
import ClipboardScreen from '@/components/Clipboard';
import { getClipboard, setClipboard } from '@/service/clipboardService';
import { createClipboardEntry, fetchClipboardEntries } from '@/service/firebaseService';
import { Clipboard } from '@/service/models';
import { getDeviceId } from '@/service/deviceService';

export default function Homepage() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';

	const [data, setData] = useState("");
    const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
	const [clipboardEntries, setClipboardEntries] = useState<Clipboard[]>([]);

	const authContext = useContext(AuthContext); // Get AuthContext
	if (!authContext) {
		// Handle the case where AuthContext is undefined
		throw new Error("AuthContext must be used within an AuthProvider");
	}
	const { user } = authContext; // Use AuthContext to get the user
	const navigation = useNavigation();

	const handleCopy = (text: string) => {
		setClipboard(text);
	};

	const handleSave = (text: string) => {
		if(user && currentDeviceId){
			createClipboardEntry({userId: user.uid, deviceId: currentDeviceId, content: text}).then(() => {
				getClipboardData();
			});
		}
	};

	const getClipboardData = async () => {
		const deviceId = await getDeviceId();
		setCurrentDeviceId(deviceId);
		if (user) {
			fetchClipboardEntries(user.uid)
				.then((data) => setClipboardEntries(data));
		}
	};

	useEffect(() => {
        const initialize = async () => {
            try {
                // Start the interval only after the currentDeviceId is set
                const intervalId = setInterval(() => {
                    const op = getClipboard().then((text) => {
						console.log('copied text in home',text);
						setData(text);
					})
                }, 1000);

                // Cleanup the interval on unmount
                return () => clearInterval(intervalId);
            } catch (error) {
                console.error('Error during fetching clipboard data:', error);
            }
        };
        initialize();
    }, [user]);

	useEffect(() => {
        const initialize = async () => {
            try {
                // Start the interval only after the currentDeviceId is set
                const intervalId = setInterval(() => {
                    getClipboardData();
                }, 5000);

                // Cleanup the interval on unmount
                return () => clearInterval(intervalId);
            } catch (error) {
                console.error('Error during fetching clipboard data:', error);
            }
        };
        initialize();
    }, [user]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<Header navigation={navigation} />
			<ThemedView style={styles.centerContainer}>
				{!user ? (
					<Description />
				) : (
					<>
						<ThemedView style={styles.container}>
							<View style={styles.headerWithButton}>
								<ThemedText type="subtitle" style={styles.text}>Your latest copied text</ThemedText>
									<TouchableOpacity style={[styles.copyButton, { marginLeft: 10 }]} onPress={() => handleCopy(data)}>
									<Ionicons name="clipboard-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
									{Platform.OS === 'web' && (
										<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Copy Text</Text>
									)}
								</TouchableOpacity>
								<TouchableOpacity style={styles.copyButton} onPress={() => handleSave(data)}>
									<Ionicons name="save-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
									{Platform.OS === 'web' && (
										<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Save Text</Text>
									)}
								</TouchableOpacity>
							</View>
							<ThemedView style={styles.textBox}>
								<TextInput
									style={[styles.text, styles.textInput]}
									value={data}
									onChangeText={setData}
									multiline={true} // Allows text to wrap and expand vertically
									editable={true} // Makes the text input editable
								/>
							</ThemedView>
						</ThemedView>
						<ThemedView style={styles.container}>
							<View style={styles.headerWithButton}>
								<ThemedText type="subtitle" style={styles.text}>Your Clipboard Entries</ThemedText>
							</View>
							<ClipboardScreen clipboardEntries={clipboardEntries} refreshData={getClipboardData}/>
						</ThemedView>
					</>
				)}
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 16,
	},
	text: {
		color: '#000'
	},
	centerContainer: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
	},
	container: {
		backgroundColor: '#fff',
		padding: 16,
		borderRadius: 16,
		overflow: 'hidden'
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
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	itemContainerDark: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		marginBottom: 16,
		borderRadius: 8,
		backgroundColor: '#1e1e1e',
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
		color: '#fff',
	},
	itemExpiryLight: {
		fontSize: 14,
		color: '#666',
	},
	itemExpiryDark: {
		fontSize: 14,
		color: '#aaa',
	},
	itemContent: {
		flex: 1,
	},
	mainClipContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	mainClipContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderRadius: 5,
	},
	mainClipContentLight: {
		backgroundColor: '#fff',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	mainClipContentDark: {
		backgroundColor: '#1e1e1e',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 3,
	},
	buttonContainer: {
		flexDirection: 'row',
		marginLeft: 10,
	},
	textBox: {
		flex: 1,
		shadowColor: '#F0F1CF',
		shadowOffset: { width: 4, height: 4 },
		borderColor: '#000',
		borderStyle: 'solid',
		borderWidth: 1,
		borderRadius: 5,
		marginTop: 10,
		backgroundColor: '#fff'
	},
	headerWithButton: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
	},
	copyButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 8,
		borderRadius: 5,
	},
	copyButtonText: {
		marginLeft: 5,
		fontWeight: 'bold',
	},
	scrollView: {
		flex: 1,
	},
	textInput: {
		minHeight: 180, // Ensures a minimum height but allows for expansion
		flex: 1, // Ensures the TextInput takes the full height and width of the container
		textAlignVertical: 'top', // Aligns text at the top if multiline
		padding: 10, // Removes default padding to match the ThemedText style
	},
});
