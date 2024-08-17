import React, { useEffect, useState, useContext, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Header from '../../components/Header';
import Description from '@/components/Description';
import { useNavigation } from 'expo-router';
import { useAuth } from '@/auth/AuthContext'; // Import AuthContext
import ClipboardScreen from '@/components/Clipboard';
import { getClipboard, setClipboard } from '@/service/clipboardService';
import { createClipboardEntry, fetchClipboardEntries, listenToClipboardEntries } from '@/service/firebaseService';
import { Clipboard } from '@/service/models';
import useDeviceDetails from '@/hook/useDeviceDetails';
import Alert from '@/components/Alert';

export default function Homepage() {
	const colorScheme = useColorScheme();
	const isDarkMode = colorScheme === 'dark';

	const [data, setData] = useState("");
	const [saveTextData, setSaveTextData] = useState("");
	const [clipboardEntries, setClipboardEntries] = useState<Clipboard[]>([]);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const { user } = useAuth(); // Use AuthContext to get the user
	const navigation = useNavigation();
	const { deviceId, deviceName } = useDeviceDetails();

	const showAlert = (message: string) => {
		setAlertMessage(message);
		setAlertVisible(true);
		setTimeout(() => setAlertVisible(false), 3000); // Dismiss alert after 3 seconds
	};

	const handleCopy = (text: string) => {
		setClipboard(text, showAlert, "Copied to clipboard"); // Pass the showAlert function
	};

	const handleSave = (text: string) => {
		if (user && deviceId) {
			if (text) {
				createClipboardEntry({ userId: user.uid, deviceId: deviceId, deviceName: deviceName, content: text });
				showAlert("Text saved to clipboard")
			} else {
				showAlert("Please enter some text to save!")
			}
		}
	};

	const refresh = (clipboards: Clipboard[]) => {
		setClipboardEntries(clipboards);
		// setData(cli)
	}

	const dataRef = useRef<string | null>(null);
	useEffect(() => {
		dataRef.current = data; // Keep the ref updated with the latest data state
	}, [data]);

	useEffect(() => {
		const initialize = async () => {
			try {
				if (user && deviceId) {
					const unsubscribe = listenToClipboardEntries(user.uid, setClipboardEntries);
					return () => unsubscribe();
				}
				if (user) {
					const clipboardIntervalId = setInterval(() => {
						getClipboard()
							.then((text) => {
								if (text !== dataRef.current) {
									setData(text);
									createClipboardEntry({ userId: user.uid, deviceId: deviceId, deviceName: deviceName, content: text });
								}
							})
							.catch(() => { });
					}, 1000);
					// Cleanup function for intervals when component unmounts
					return () => {
						clearInterval(clipboardIntervalId);
					};
				}
			} catch (error) {
				console.error('Error during initialization:', error);
			}
		};
		initialize();
	}, [user, deviceId]);

	return (
		<>
			<Alert message={alertMessage} visible={alertVisible} />
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				showsVerticalScrollIndicator={false} // Optional: hides the vertical scrollbar
				horizontal={false} // Ensures horizontal scrolling is disabled
			>
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
										<View style={styles.buttonContainer}>
											<TouchableOpacity style={[styles.copyButton, { marginLeft: 10 }]} onPress={() => handleCopy(data)}>
												<Ionicons name="clipboard-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
												{Platform.OS === 'web' && (
													<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Copy Text</Text>
												)}
											</TouchableOpacity>
										</View>
									</View>
									<View style={styles.textBox}>
										<TextInput
											style={[styles.text, styles.textInput]}
											value={data}
											onChangeText={setData}
											multiline={true}
											editable={false}
										/>
									</View>
								</ThemedView>
								<ThemedView style={styles.container}>
									<View style={styles.headerWithButton}>
										<ThemedText type="subtitle" style={styles.text}>Save to clipboard</ThemedText>
										<View style={styles.buttonContainer}>
											<TouchableOpacity style={styles.copyButton} onPress={() => handleSave(saveTextData)}>
												<Ionicons name="save-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
												{Platform.OS === 'web' && (
													<Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Save Text</Text>
												)}
											</TouchableOpacity>
										</View>
									</View>
									<View style={styles.textBox}>
										<TextInput
											style={[styles.text, styles.textInput]}
											value={saveTextData}
											onChangeText={setSaveTextData}
											multiline={true} // Allows text to wrap and expand vertically
											editable={true} // Makes the text input editable
										/>
									</View>
								</ThemedView>
								<ThemedView style={styles.container}>
									<View style={styles.headerWithButton}>
										<ThemedText type="subtitle" style={styles.text}>Your Clipboard Entries</ThemedText>
									</View>
									<ClipboardScreen clipboardEntries={clipboardEntries} showAlert={showAlert} />
								</ThemedView>
							</>
						)}
					</ThemedView>
				</SafeAreaView>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: Platform.OS === 'web' ? 0 : 18,
	},
	text: {
		color: '#000'
	},
	centerContainer: {
		backgroundColor: '#fff',
		padding: Platform.OS === 'web' ? 16 : 5,
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
		flex: 0.5,
		borderColor: '#000',
		borderRadius: 0
	},
	textInput: {
		minHeight: 100,
		flex: 0.5,
		borderWidth: 1,
		borderColor: '#000',
		textAlignVertical: 'top',
		padding: 10,
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
});
